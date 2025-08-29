## Introduction

A popular dataset in machine learning is the MNIST dataset (stored in the [MNIST database](http://yann.lecun.com/exdb/mnist/)) which contains a collection of 70,000 handwritten digits from 0 to 9. When learning the fundamentals of machine learning, one might be asked to construct and train a neural network which takes as input an image from the MNIST dataset and outputs the classification of the digit present in the image.

Let's assume that we have created a network with an output layer of 10 neurons (one for each class).

![Three layer neural network.](./assets/neural-network-3-layer.svg "A simplified three layer neural network with fully connected nodes. The first layer takes as input an image of a handwritten digit and will have many many nodes, namely one for each pixel! In practice there will be many more hidden layers as well, but for now we just have that one layer in the middle. True to our excercise, the output layer has 10 neurons, one for every digit classification.")

Now, let us add an additional output layer that takes as input the one-hot encoding for classification and outputs the bitwise representation of the digit using 4 neurons. Our goal is to manually derive a set of weight and biases for the final layer that achieves this goal.

![Four layer neural network.](./assets/neural-network-4-layer.svg "The same exact network as in the above image, but with a new output layer added onto the end.")

In this article, we will walk through the manual derivation of these weights and biases, taking steps to ensure followability. Note that this excercise is an adaptation from one proposed in [Neural Networks and Deep Learning](https://neuralnetworksanddeeplearning.com/chap1.html).

## Neuron Type

The artificial neuron is the building block of our artificial neural network. At it's basis, the neuron takes some input and applies a mathematical operation to give an output. The type mathematical operation depends on the type of neuron. Thus, before we can solve for a set of weight and biases, we need to know which type of neuron we are dealing with.

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

In our case, the expected result is a bitwise representation of the digit present in the input image. This excercise in particular aims to show that machine learning is math not magic! by manually deriving a possible solution set of weights and biases for the final layer in our classification network.

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

which states $y_0(i)$ will be $1$ if the input is either $i = 8$ or $i = 9$ and will be $0$ otherwise. Examining the first inequality, just need to set $w_{80}$ and $w_{90}$ greater than $-b_0$. Since we only need to find _a_ solution set not _the_ solution set, lets equate

$$
w_{80} = w_{90} = -b_0 + 1
$$

to satisfy our first inequality. Similarly for the second inequality, we can set

$$
w_{i0} = -b_0, \quad \forall i \in \\{0, ..., 7\\}
$$

. We will leave the derivation of a solution set for the rest of the bitwise neurons up to the reader!

## Results Verification

The best part about math is that you can test objectively whether you are right or wrong. In this section, we will verify our results using a small python program.

> "The intersection of mathematics and engineering creates possibilities that neither field could achieve alone."

![Camera projection model](./assets/present.svg "3D to 2D projection visualization")
