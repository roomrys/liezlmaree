## Introduction

A popular dataset in machine learning is the MNIST dataset (stored in the [MNIST database](http://yann.lecun.com/exdb/mnist/)) which contains a collection of 70,000 handwritten digits from 0 to 9. When learning the fundamentals of machine learning, one might be asked to construct and train a neural network which takes as input an image from the MNIST dataset and outputs the classification of the digit present in the image.

Let's assume that we have created a network with an output layer of 10 neurons (one for each class).

![Three layer neural network.](./assets/neural-network-3-layer.svg "A simplified three layer neural network with fully connected nodes. The first layer takes as input an image of a handwritten digit and will have many many nodes, namely one for each pixel! In practice there will be many more hidden layers as well, but for now we just have that one layer in the middle. True to our excercise, the output layer has 10 neurons, one for every digit classification.")

Now, let us add an additional output layer that takes as input the one-hot encoding for classification and outputs the bitwise representation of the digit using 4 neurons. Our goal is to manually derive a set of weight and biases for the final layer that achieves this goal.

![Four layer neural network.](./assets/neural-network-4-layer.svg "The same exact network as in the above image, but with a new output layer added onto the end.")

In this article, we will walk through the manual derivation of these weights and biases, taking steps to ensure followability. Note that this excercise is an adaptation from one proposed in [Neural Networks and Deep Learning](https://neuralnetworksanddeeplearning.com/chap1.html).

## Neuron Type

The artificial neuron is the building block of our artificial neural network. At it's basis, the neuron takes some input and applies a mathematical operation to give an output. The type of mathematical operation depends on the type of neuron. Thus, before we can solve for a set of weight and biases, we need to know which type of neuron we are dealing with.

While not the first type of neuron, the **perceptron neuron** is simple neuron that takes a weighted sum of the inputs and outputs a binary value of either 0 or 1 - depending on whether the weighted sum is over a certain threshold. A more complicated neuron is the **sigmoid neuron** which applies a sigmoid function to the weighted sum of inputs and outputs a continuous value between 0 and 1. Each of these neurons come with their own problems (search vanishing gradient), and there are other types of neurons that are more commonly used.

![Single neuron.](./assets/neuron.svg "A single neuron with two inputs $x_1$ and $x_2$ and its output $y_1$. Note that neurons will always only have one output, but this output could be connected to many other nodes and have a different weight for each connection. Notice that each input has an associated weight $w$ and that the neuron has an associated bias $b_1$.")

For simplicity, we will use the perceptron neuron for the classification layer of our network which can be modeled as follows:

$$
y =
\begin{cases}
1 & \text{if } \bm{w} \cdot \bm{x} > -b \\\\
0 & \text{if } \bm{w} \cdot \bm{x} \leq -b
\end{cases}
$$

where $y$ is the output of the neuron, $\bm{w}$ is a vector of weights, $\bm{x}$ is a vector of inputs (the same length as $\bm{w}$), and $b$ is a scalar representing the neuron bias.

## Weights and Biases

Every input will have a corresponding weight that scales the input. Every neuron will have a bias that is used to offset the activation threshold.

When training a machine learning model, we are iteratively updating the weights and biases of our model to get closer to "our goal" (which is represented by some loss or evalution function). Ideally, at the end of training, we are left with perfectly tuned weights and biases that, when applied to our network, outputs the expected result.

In our case, the expected result is a bitwise representation of the digit present in the input image.

> This excercise in particular aims to show that machine learning is math not magic! by manually deriving a possible solution set of weights and biases for the final layer in our classification network.

## Map: Classification to Bitwise

Before we can get going with a system of equations for our derivation, we need to map out the neuron behavior we desire. Namely, we need to map which bitwise neurons fire (output 1) when receiving which classifications as input.

Converting digits 0 through 9 to their binary form yields:

```json
0: 0000
1: 0001
2: 0010
3: 0011
4: 0100
5: 0101
6: 0110
7: 0111
8: 1000
9: 1001
```

. Now, let us list the digits for which each bit is active.

The Most Significant Bit (MSB, the leftmost bit) is active only for the numbers 8 and 9. The second MSB is active for the numbers 4, 5, 6, and 7. The third MSB is active for the numbers 2, 3, 6, and 7. And, lastly, the Least Significan Bit (LSB) is active for the numbers 1, 3, 5, 7, and 9.

```json
"first msb": 8, 9
"second msb": 4, 5, 6, 7
"third msb": 2, 3, 6, 7
"lsb": 1, 3, 5, 7, 9
```

This map is important because it shows us which neurons in the bitwise output layer need to fire and when.

## A System of Equations

All great derivations start with a system of equations. In this section we first simplify the equation for our neuron output, then we derive a general form, and finally we derive a solution set for the most significant bit neuron.

### Simplify Neuron Output Equation

First, let us derive the equations for the output of our bitwise neurons. We already know the general form of the output as $y = 1$ if $\bm{w} \cdot \bm{x} > -b$. However, we can simplify this based on the one-hot encoding of our classifiaction layer:

$$
\bm{y} = \bm{e}_i
$$

where $\bm{i}$ is the vector of outputs from our classification layer and $\bm{e}_i$ denotes the $i^{\text{th}}$ elementary vector. Thus, classification as the $i^{\text{th}}$ class will yield the $i^{\text{th}}$ elementary vector.

The output of the classification layer is then used as input to the bitwise layer. Hence, all of our inputs are elementary vectors which simplfies our bitwise output equations as follows

$$
\begin{aligned}
y &=
\begin{cases}
1 & \text{if } \bm{w} \cdot \bm{e}_i > -b \\\\
0 & \text{if } \bm{w} \cdot \bm{e}_i \leq -b
\end{cases} \\\\
 &=
\begin{cases}
1 & \text{if } w_i > -b \\\\
0 & \text{if } w_i \leq -b
\end{cases}
\end{aligned}
$$

where our equation for the output of a single neuron $y$ now depends on only a single scalar weight $w_i$ (and the bias term $b$).

### General Form of Bitwise Neuron Output

Using our simplification and activation map above, we can create two equations for each binary bit yielding a total of 8 equations. The general form of our equation will be as follows:

$$
y_j(i) =
\begin{cases}
1 & \text{if } w_{ij} > -b_j \\\\
0 & \text{if } w_{ij} \leq -b_j
\end{cases}
\text{,}\quad
\begin{aligned}
& i \in \\{0,1,\dots,9\\} \\\\
& j \in \\{0,1,\dots,3\\}
\end{aligned}
$$

where $y_j(i)$ is the output of neuron $j$ given classification $i$ as input, $w_{ij}$ denotes the weight for the $i^{\text{th}}$ input into neuron j and $b_j$ denotes the bias for neuron $j$.

### Solution Set for Most Significant Bit Neuron

For the most significant bit $j = 0$ we have:

$$
y_0(i) =
\begin{cases}
1 & \text{if } w_{i0} > -b_0, \\;  i \in \\{8,9\\} \\\\
0 & \text{if } w_{i0} \leq -b_0, \\; \text{otherwise}
\end{cases}
$$

which states $y_0(i)$ will be $1$ if the input is either $i = 8$ or $i = 9$ and will be $0$ otherwise. Examining the first inequality, just need to set $w_{80}$ and $w_{90}$ greater than $-b_0$. Since we only need to find _a_ solution set not _the_ solution set, let's equate

$$
w_{80} = w_{90} = -b_0 + 1
$$

to satisfy our first inequality. Similarly for the second inequality, we can set

$$
w_{i0} = -b_0, \quad \forall i \in \\{0, ..., 7\\}
$$

. We will leave the derivation of a solution set for the rest of the bitwise neurons up to the reader!

## Results Verification

In this section, we will verify our results using a small python program. One of the great things about this excercise is that we can objectively test whether we are right or wrong. And, a great thing about computers is that they can do the tedious work we don't want to... like multiplying and adding lots of numbers together to verify whether our derived weights and biases are correct.

First, let us import numpy and define a few helper functions

```python
import numpy as np


def binary_threshold(x: np.ndarray, threshold: float = 0.5) -> np.ndarray:
    """A simple binary threshold activation function.

    Args:
        x: Input array.
        threshold: Threshold value for activation. Defaults to 0.5.

    Returns:
        Binary output array after applying the threshold.
    """
    return np.where(x > threshold, 1, 0)


def binary_to_integer(binary_array: np.ndarray) -> np.ndarray:
    """Convert a binary array to its integer representation.

    Args:
        binary_array: A 2D numpy array where each row represents a binary number. Shape
            (n, 4).

    Returns:
        Integer representation of the binary input. Shape (n,).
    """
    integer_output = np.dot(binary_array, [8, 4, 2, 1])

    print(f"\nInteger output after converting from binary:\n{integer_output}")
    print(f"\nExpected output:\n{np.arange(10)}")

    return integer_output
```

. Now, we will define a function to represent all neurons in our bitwise output layer

```python
def bitwise_layer(
    inputs: np.ndarray, weights: np.ndarray, biases: np.ndarray
) -> np.ndarray:
    """A layer of p perceptron neurons.

    Args:
        inputs: Input data array of shape (n, m).
        weights: Weights array of shape (m, p).
        biases: Biases array of shape (p,).

    Returns:
        Binary output array after applying weights, biases, and thresholding.
            Shape (n, p).
    """
    biased_weighted_sum = np.dot(inputs, weights) + biases
    binary_output = binary_threshold(biased_weighted_sum, threshold=0)

    print(f"\nDerived initialization output:\n{biased_weighted_sum}")
    print(f"\nBinary output after thresholding:\n{binary_output}")

    return binary_output

```

.

> Note that we use a threshold of 0 because we already added the biases to our weighted sum of inputs.

Now, we'll initialize a series of inputs to our bitwise layer. Namely, we want to test that our bitwise layer works correctly for all numbers from 0 to 9. Thus, we'll define our classification layer output as the identity matrix of size 10

```python
n_classes = 10

# Define the classification layer output (which are the inputs to our bitwise layer).
classification_output = np.eye(n_classes)
```

.

### Random Initialization

First, let's just write a small program that uses a random initialization of the weights and biases to see the results.

```python
n_bits = 4

# Randomly initialize the weights and biases (ensuring correct shapes).
weights = np.random.rand(n_classes, n_bits)
biases = np.random.rand(n_bits)

# Get the outputs of our bitwise layer!
bitwise_output = bitwise_layer(classification_output, weights, biases)

# Check if we are correct.
integer_output = binary_to_integer(bitwise_output)
```

> When running the above (a few times) you'll notice that we usually, if not always, get an integer output of $15$. As an exercise, can you deduce why this is the case given our random initialization?

As expected, the final bitwise representation is not what we are looking for. Instead, you might see an output similar to the following:

```python
Derived initialization output:
[[1.41549818 0.29060016 0.77759153 0.75126548]
 [1.66392395 0.2879375  0.43068305 0.40664773]
 [1.46691699 0.3509655  0.90414155 1.00616692]
 [1.31507287 0.39994898 1.21248619 0.37076295]
 [1.65611059 0.06919332 0.39458236 1.11085204]
 [1.11461611 0.30015701 1.17975765 0.45963969]
 [1.50487902 0.60395604 0.61209481 1.06772611]
 [1.8191667  0.2088428  0.65044517 0.49956045]
 [1.47952076 0.63749747 1.15667704 1.05499824]
 [1.10373711 0.88452492 0.53125971 0.5498114 ]]

Binary output after thresholding:
[[1 1 1 1]
 [1 1 1 1]
 [1 1 1 1]
 [1 1 1 1]
 [1 1 1 1]
 [1 1 1 1]
 [1 1 1 1]
 [1 1 1 1]
 [1 1 1 1]
 [1 1 1 1]]

Integer output after converting from binary:
[15 15 15 15 15 15 15 15 15 15]

Expected output:
[0 1 2 3 4 5 6 7 8 9]
```

.

### Derived Initialization

Now, let's set the weights and biases to our derived solution set.

```python
# For the Most Significant Bit (MSB), we want
weights[0:8, 0] = -1 - biases[0]
weights[8:10, 0] = - biases[0]

# For the 2nd Most Significant Bit
...  # TODO: place your own derived solution here.

# For the 3rd Most Significant Bit
...  # TODO: place your own derived solution here.


# For the Least Significant Bit (LSB)
...  # TODO: place your own derived solution here.
```

Great, and re-running the test code

```python
bitwise_output = bitwise_layer(classification_output, weights, biases)
integer_output = binary_to_integer(bitwise_output)
```

we should now get the correct output

```python
Derived initialization output:
[[-1. -1. -1. -1.]
 [-1. -1. -1.  0.]
 [-1. -1.  0. -1.]
 [-1. -1.  0.  0.]
 [-1.  0. -1. -1.]
 [-1.  0. -1.  0.]
 [-1.  0.  0. -1.]
 [-1.  0.  0.  0.]
 [ 0. -1. -1. -1.]
 [ 0. -1. -1.  0.]]

Binary output after thresholding:
[[0 0 0 0]
 [0 0 0 0]
 [0 0 0 0]
 [0 0 0 0]
 [0 0 0 0]
 [0 0 0 0]
 [0 0 0 0]
 [0 0 0 0]
 [0 0 0 0]
 [0 0 0 0]]

Integer output after converting from binary:
[0 0 0 0 0 0 0 0 0 0]

Expected output:
[0 1 2 3 4 5 6 7 8 9]
```

. Perfect!

That's all, thanks for following along. Check back in the future for more articles ranging from fundamentals to research-level of many math-based topics.
