## Introduction

Image inpainting is the process of filling in missing parts of an image. The missing part of the image could be intentionally masked and removed such as when removing an unwanted foreground object from a scene. Ideally, the missing pixels will then be filled with generated background pixels.

![Image inpainting](./assets/inpainting-example.svg "Above is an illustrative example of what we hope to achieve with inpainting. The left image has some pixels removed with a few black marker strokes. On the right, the pixels are restored via inpainting.")

Not all techniques for inpainting are based on neural networks. In fact, the popular OpenCV library provides two algorithms for image inpainting (cv.INPAINT_TEALEA and CV.INPAINT_NS), neither of which are based on neural networks.

The proposed improvement we will be discussing is for deep-learning based inpainting. When we further refer to inpainting, we refer to deep-learning based inpainting.

## Problem

A common problem when inpainting images is that the quality of the inpainting is poor when attempting to inpaint an image with higher resolution than was used while training the network. This has been linked to the receptive field which - if it stays the same size - will take in the same amount of pixel information for all image sizes, but will see less global structure for higher resolution images.

![Receptive Field](./assets/receptive-field.svg "Here we see an example of a statically sized receptive field applied to the pixels of a low resolution and high resolution copy of the same image. The receptive field will see 3x3 pixels for both the low and high resolutions. Howevever, a 3x3 block pixels in the low resolution image cover more global context whereas the 3x3 block in the high resolution trades off global context for detail.")

A possible workaround is to downsample the high resolution image to a resolution closer to that of the network's training set, but then we sacrifice the detail of the higher resolution image.

## Proposed Solution: Multi-Scale Feature Refinement

The proposed solution improves inpainting quality of existing networks by using a coarse-to-fine iterative refinement approach that optimizes featuremaps via a multi-scale loss with no additional training required (featuremaps are refined during inference).

The intuition behind the algorithm is that existing networks already output good inpainting results for lower resolution images. Thus, if we start by predicting a good low resolution inpainting, then we can use the good inpainting to improve the inpainting at a slightly higher resolution. This process is then repeated at higher and higher resolutions until we get an inpainting at the desired resolution.

### Algorithm

In this section, we go over the proposed algorithm for multi-scale feature refinement.

The inputs to the multi-scale feature refinement are the image to inpaint, the inpainting mask, the inpainting model, and the smallest scale to refine features in.

```python
# Algorithm 1 from [1]

def predict_and_refine(image, mask, inpainted_low_res, model, lr=0.001, n_iters=15):
    z = model.front.forward(image, mask)
    # configure optimizer to update the featuremap optimizer = Adam([z], lr)
    for _ in range(n_iters):
        optimizer.zero_grad()
        inpainted = model.rear.forward(z)
        inpainted_downscaled = downscale(inpainted)
        loss = l1_over_masked_region(
            inpainted_downscaled, inpainted_low_res, mask
        )
        loss.backward()
        optimizer.step() # Updates z
    # final forward pass
    inpainted = model.rear.forward(z)
    return inpainted

def multiscale_inpaint(image, mask, model, smallest_scale=512):
    images, masks = build_pyramid(image, mask, smallest_scale)
    n_scales = len(images)
    # initialize with the lowest scale inpainting
    inpainted = model.forward(images[0], masks[0])
    for i in range(1, n_scales):
        image, mask = images[i], masks[i]
        inpainted_low_res = inpainted
        inpainted = predict_and_refine(
            image, mask, inpainted_low_res, model
        )
    return inpainted
```

Using the input image, inpainting mask, and scale, an image-pyramid is generated with images and masks down to the smallest given scale.

Then, per usual, the provided inpainting model is used in conjuction with the lowest scale image and mask to provide an initial inpainting prediction. In a normal scenario, this would be the provided result (given we opted to use a downsampled image to get better inpainting results than the high resolution image). However, with the proposed multi-scale inpainting, we proceed to iteratively refine the inpainting results at different resolutions via a "predict and refine" module.

![Image pyramid](./assets/image-pyramid.svg "An image-pyramid is a stack of the same image at different resolutions. There are two different types of image pyramids: Gaussian and Laplacian. In this blog we refer to Gaussian image pyramids which are created by iteratively applying a Gaussian kernel to a higher resolution image to output a blurred and downsampled image.")

Going from low resolution to high resolution, at each scale, we first obtain the image and mask from the image-pyramid. Then, we pass the image, mask, previous scale's inpainted prediction, inpainting model, and number of iteration to our "predict and refine" module.

In the "predict and refine" module, we first encode our image and mask into a latent featuremap $z$. This latent featuremap is then optimized iteratively for the provided number of iterations. Each iteration of this optimization begins by predicting the inpainting by passing $z$ through a decoding block. The inpainting is then downsampled to the previous resolution and compared to the previous scale's inpainted prediction. This comparison is used as our loss. The loss is backpropogated and the optimizer updates the latent feature map $z$ to reduce the loss.

After a given number of iterations, we pass the optimized $z$ through the model's decoding block to get our final inpainted prediction _at this resolution_. The entire "predict and refine" module is then repeated for finer and finer resolutions until we reach our desired high-resolution inpainting prediction.

### Experiment Details

| Parameter                             | Value / Description                                                     |
| ------------------------------------- | ----------------------------------------------------------------------- |
| Network architecture                  | Big-LaMa                                                                |
| Dataset                               | Unsplash-Lite Dataset                                                   |
| Downsampling factor for image-pyramid | 2                                                                       |
| Optimizing                            | Output feature map from downscaler portion of Big-LaMa                  |
| Number refinement iterations          | 15 at each scale                                                        |
| Learning rate                         | 0.002                                                                   |
| Loss function                         | L1                                                                      |
| Data augmentation                     | Images resized and cropped to 1024 x 1024                               |
| Additional augmentation               | Erode inpaint mask with 15 pixel circular kernel prior to applying loss |
| Mask widths                           | Thin, medium, and thick brush strokes                                   |

In their experiments, Kulshreshtha et al. chose to optimize for the output feature map from the downscaler portion of Big-LaMa. The insight behind this choice is that featuremaps farther from the prediction layer influence more of output due to larger receptive field.

The experiment was run using thin, medium, and thick brush strokes. The inpaint quality was evaluated on each of the three brush strokes separately.

Furthermore, because the inpainting network already performs well in thin regions, Kulshreshtha et al. erroded their mask before calculating the loss to prevent uneccessarily optimizing against these regions.

Due to lack of high resolutions in the typically benchmarked Places2 dataset, Kulshreshtha et al. used the the Unsplash-Lite dataset which contains 25k high resolution images.

### Results

| Area           | Results                                                                        |
| -------------- | ------------------------------------------------------------------------------ |
| Inpaint        | At or above state-of-the-art                                                   |
| Inference-time | Significantly longer (proportional to number of scales and optimization steps) |
| Memory         | Increased usage at runtime                                                     |

At the time of writing their paper, Kulshreshtha et al. reported outperforming state-of-the-art inpainting networks for medium and thick brush strokes and matching performance for thin brush strokes. The matched performance for thin brush strokes was due to neither network struggling with inpainting thin masks (adequate receptive field size).

However, the refinement process took significantly longer to process an image than other methods. Namely, inference time was increased proportionally to number of scales and optimization steps. Also, the increased memory usage from the scale refinement step limits the resolution of images that can be loaded.

## Future Improvements

In the results section, we discover the limitations of the current approach: inference time and memory usage. Here we look towards possible future directions to resolve these issues.

While we realize that the psuedocode may be a simplification of the actual implementation, we see that the refinement step is always run for a fixed number of steps. Thus, one idea for reducing both inference time and memory usage would be to add an early stopping criteria to our refinement loop.

An interesting idea to experiment with is adaptive scale selection instead of uniform downsampling. With a uniform downsampling approach, while the number of rows/columns of pixels skipped remains the same at each scale, the amount of global context lost is much more significant at lower resolutions than at higher resolutions. This raises the question of whether we can use a larger downsampling factor for higher resolutions and decrease this factor as we get to lower resolutions. If possible, we could hypothetically arrive at our final resolution with fewer refinement iterations leading to both less memory usage and inference time.

That's all for now. Thanks for following along! Check back in the future for more articles from fundamentals to research-level content.

## References

1. Kulshreshtha, P., Pugh, B., & Jiddi, S. (2022). [Feature Refinement to Improve High Resolution Image Inpainting](https://arxiv.org/abs/2206.13644). arXiv:2206.13644.
