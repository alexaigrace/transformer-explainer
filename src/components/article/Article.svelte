<script>
	import tailwindConfig from '../../../tailwind.config';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import Katex from '~/utils/Katex.svelte';
	import { locale } from '~/i18n';
</script>

{#if $locale === 'zh'}
	<div id="description">
		<div class="article-section" data-click="article-intro">
			<h1>什么是 Transformer？</h1>

			<p>
				Transformer 是一种神经网络架构，它彻底改变了人们做人工智能的方式。Transformer 最早出现在
				2017 年那篇经典论文
				<a
					href="https://dl.acm.org/doi/10.5555/3295222.3295349"
					title="ACM Digital Library"
					target="_blank">"Attention is All You Need"</a
				>
				里（大意是“注意力就是你需要的一切”），从那以后就成了深度学习模型的首选架构，撑起了 OpenAI 的
				<strong>GPT</strong>、Meta 的 <strong>Llama</strong>、Google 的 <strong>Gemini</strong>
				这些文字生成模型。除了文字，Transformer 也被用在
				<a
					href="https://huggingface.co/learn/audio-course/en/chapter3/introduction"
					title="Hugging Face"
					target="_blank">音频生成</a
				>、
				<a
					href="https://huggingface.co/learn/computer-vision-course/unit3/vision-transformers/vision-transformers-for-image-classification"
					title="Hugging Face"
					target="_blank">图像识别</a
				>、
				<a href="https://elifesciences.org/articles/82819" title="eLife">蛋白质结构预测</a>，甚至
				<a
					href="https://www.deeplearning.ai/the-batch/reinforcement-learning-plus-transformers-equals-efficiency/"
					title="Deep Learning AI"
					target="_blank">玩游戏</a
				>
				上，可见它适用于很多领域。
			</p>
			<p>
				Transformer 说到底只做一件事：<strong>预测下一个词元</strong>（next-token
				prediction）。你给它一段提示文字，它会回答：接下来
				<em>最可能出现的词元（一个词，或者词的一部分）</em>是哪个？Transformer
				真正的创新和厉害之处，在于它用了自注意力（让每个词去看看其他词）机制，能一次处理整个句子，比以前的架构更好地抓住长距离的关联。
			</p>
			<p>
				GPT-2 系列模型是文字生成 Transformer 中最有名的例子。Transformer Explainer 靠的是
				<a href="https://huggingface.co/openai-community/gpt2" title="Hugging Face" target="_blank"
					>GPT-2</a
				>
				（small）模型，它一共有 1.24 亿个参数。它虽然不是最新、最强的 Transformer 模型，但和现在最先进的模型共享很多相同的结构和原理，所以很适合用来入门。
			</p>
		</div>

		<div class="article-section" data-click="article-overview">
			<h1>Transformer 的架构</h1>

			<p>所有文字生成 Transformer 都由这 <strong>三个关键部分</strong>组成：</p>
			<ol>
				<li>
					<strong class="bold-purple">嵌入（Embedding）</strong
					>：输入的文本会先切成更小的单位，叫做词元（token），它可能是一个词，也可能是词的一部分。这些词元会被转换成数字向量，也就是嵌入，用来表示词语的含义。
				</li>
				<li>
					<strong class="bold-purple">Transformer 块（Transformer Block）</strong
					>是模型最基本的结构单元，负责处理和转换输入数据。每个块里包含：
					<ul class="">
						<li>
							<strong>注意力机制（Attention Mechanism）</strong>，这是 Transformer
							块的核心。它让词元之间可以互相交流，从而抓住上下文信息和词与词之间的关系。
						</li>
						<li>
							<strong>MLP（多层感知机）层</strong
							>，一个前馈网络，对每个词元单独处理。注意力层的目标是在词元之间传递信息，而 MLP
							的目标是把每个词元自己的表示打磨得更好。
						</li>
					</ul>
				</li>
				<li>
					<strong class="bold-purple">输出概率（Output Probabilities）</strong>：最后的线性层和
					Softmax（把分数变成概率）层会把处理好的嵌入变成概率，模型据此预测序列里的下一个词元。
				</li>
			</ol>
		</div>

		<div class="article-section" id="embedding" data-click="article-embedding">
			<h2>嵌入（Embedding）</h2>
			<p>
				假设你想用 Transformer 模型写一段文字，于是输入这样一句提示：<code
					>“Data visualization empowers users to”</code
				>。模型看不懂普通文字，必须先把它转成自己能处理的格式，这就是嵌入要做的事：把文字变成一串数字。要把提示变成嵌入，需要
				1）切分输入，2）取出词元嵌入，3）加入位置信息，最后
				4）把词元编码和位置编码相加，得到最终的嵌入。下面一步步来看。
			</p>
			<div class="figure">
				<img
					src="./article_assets/embedding.png"
					width="65%"
					alt="Transformer 输入嵌入过程示意图"
				/>
			</div>
			<div class="figure-caption">
				图 <span class="attention">1</span>。展开 Embedding
				层的视图，展示输入提示如何被转换成向量表示。整个过程包括
				<span class="fig-numbering">(1)</span> 分词（Tokenization）、(2) 词元嵌入（Token Embedding）、(3)
				位置编码（Positional Encoding），以及 (4) 最终嵌入（Final Embedding）。
			</div>
			<div class="article-subsection">
				<h3>第 1 步：分词（Tokenization）</h3>
				<p>
					分词就是把输入文字切成更小、更好处理的小块，这些小块叫做词元（token）。一个词元可能是一个完整的词，也可能是词的一部分。比如
					<code>"Data"</code> 和 <code>"visualization"</code> 各自对应一个词元，而
					<code>"empowers"</code>
					会被切成两个词元。词表里有哪些词元，是在训练模型之前就定好的：GPT-2 的词表里有
					<code>50,257</code>
					个不同的词元。现在输入文字已经切成了带编号的词元，接下来就能从嵌入里取出它们的向量了。
				</p>
			</div>
			<div class="article-subsection" id="article-token-embedding">
				<h3>第 2 步：词元嵌入（Token Embedding）</h3>
				<p>
					GPT-2（small）把词表里的每个词元表示成一个 768
					维的向量，向量的维度由模型决定。这些嵌入向量存在一个形状为
					<code>(50,257, 768)</code> 的矩阵里，大约有 3900 万个参数！这么大的矩阵让模型能给每个词元赋予含义：在语言里用法或意思相近的词元，在这个高维空间里靠得比较近；差别大的词元就离得比较远。
				</p>
			</div>
			<div class="article-subsection" id="article-positional-embedding">
				<h3>第 3 步：位置编码（Positional Encoding）</h3>
				<p>
					嵌入层还会记录每个词元在输入提示里的位置。不同模型用的位置编码方法各不相同。GPT-2
					的位置编码矩阵是自己从头训练出来的，直接融进了训练过程。
				</p>
			</div>
			<div class="article-subsection">
				<h3>第 4 步：最终嵌入（Final Embedding）</h3>
				<p>
					最后，把词元编码和位置编码相加，就得到最终的嵌入表示。这个结果既包含词元的含义，也包含它在输入序列中的位置。
				</p>
			</div>
		</div>

		<div class="article-section" data-click="article-transformer-block">
			<h2>Transformer 块（Transformer Block）</h2>

			<p>
				Transformer 真正干活的地方是 Transformer 块，它由多头自注意力和
				MLP（多层感知机）层组成。大多数模型会把很多这样的块一层接一层地叠起来。词元的表示从第一个块走到最后一个块，一路上不断变化，模型也因此在每一层积累出越来越细致的理解，得到更高层次的表示。我们正在看的
				GPT-2（small）模型一共有
				<code>12</code> 个这样的块。
			</p>
		</div>

		<div class="article-section" id="self-attention" data-click="article-attention">
			<h3>多头自注意力（Multi-Head Self-Attention）</h3>
			<p>
				自注意力让模型看清句子中词元之间的关系，每个词元的表示都会受到其他词元的影响。多个注意力头让模型可以从不同角度看这些关系：比如一个头关注距离较近的语法联系，另一个头关注更广的语义背景。下面我们一步一步看多头自注意力是怎么算出来的。
			</p>
			<div class="article-subsection-l2">
				<h4>第 1 步：Query、Key、Value 矩阵</h4>

				<div class="figure pt-10">
					<img
						src="./article_assets/QKV.png"
						width="80%"
						alt="Query、Key 和 Value 向量的计算示意图"
					/>
					<div class="text-xs">
						<Katex
							displayMode
							math={`
			QKV_{ij} = ( \\sum_{d=1}^{768} \\text{Embedding}_{i,d} \\cdot \\text{Weights}_{d,j}) + \\text{Bias}_j
			`}
						/>
					</div>
				</div>
				<div class="figure-caption">
					图 <span class="attention">2</span>。从原始嵌入计算 Query、Key、Value 矩阵。
				</div>

				<p>
					每个词元的嵌入向量会变成三个向量：<span class="q-color">Query（Q）</span>、<span
						class="k-color">Key（K）</span
					>、<span class="v-color">Value（V）</span>。做法是把输入的嵌入矩阵分别乘以学到的
					<span class="q-color">Q</span>、<span class="k-color">K</span>、<span class="v-color"
						>V</span
					>
					权重矩阵。可以用搜索网页来打个比方，帮我们建立直觉：
				</p>
				<ul>
					<li>
						<strong class="q-color font-medium">Query（Q）</strong
						>就是你在搜索框里输入的那个词。它代表你想 <em>“多了解一点”</em> 的词元。
					</li>
					<li>
						<strong class="k-color font-medium">Key（K）</strong
						>是搜索结果页里每个网页的标题。它代表这个查询可能去看的词元。
					</li>
					<li>
						<strong class="v-color font-medium">Value（V）</strong
						>是网页真正的内容。当我们把搜索词（Query）和相关的结果标题（Key）对上之后，就想要最相关网页的内容（Value）。
					</li>
				</ul>
				<p>
					有了这些 QKV 值，模型就能算出注意力分数（attention
					score），由此决定生成预测时每个词元应该被关注多少。
				</p>
			</div>
			<div class="article-subsection-l2">
				<h4>第 2 步：多头拆分（Multi-Head Splitting）</h4>
				<p>
					<span class="q-color">Query</span>、<span class="k-color">Key</span> 和
					<span class="v-color">Value</span>
					向量会被拆成多个头——GPT-2（small）是拆成 <code>12</code> 个头。每个头单独处理嵌入的一部分，抓住不同的语法和语义关系。这样设计，模型可以同时学习各种语言特征，表示能力也更强。
				</p>
			</div>
			<div class="article-subsection-l2">
				<h4>第 3 步：掩码自注意力（Masked Self-Attention）</h4>
				<p>
					在每个头里，我们做的是带掩码的自注意力计算。这个机制让模型在生成序列时只关注输入里已经出现的相关内容，同时不允许它看到后面的词元。
				</p>

				<div class="figure">
					<img src="./article_assets/attention.png" width="80%" alt="掩码自注意力计算示意图" />
				</div>
				<div class="figure-caption">
					图 <span class="attention">3</span>。用 Query、Key、Value 矩阵计算掩码自注意力。
				</div>

				<ul>
					<li>
						<strong>点积（Dot Product）</strong>：把 <span class="q-color">Query</span> 和
						<span class="k-color">Key</span> 矩阵做点积，就得到
						<strong>注意力分数</strong>。结果是一个方阵，反映所有输入词元两两之间的关系。
					</li>
					<li>
						<strong>缩放 · 掩码（Scaling · Mask）</strong
						>：把注意力分数缩放，再给注意力矩阵的上三角加上掩码，不让模型看到未来的词元，这些位置会被设成负无穷。模型必须学会在不“偷看”未来的前提下预测下一个词元。
					</li>
					<li>
						<strong>Softmax · 随机丢弃（Softmax · Dropout）</strong>：掩码和缩放之后，用
						Softmax（把分数变成概率）把注意力分数变成概率，再按需用随机丢弃（dropout）做正则化。矩阵每一行的和都是
						1，表示它左边每个词元的重要程度。
					</li>
				</ul>
			</div>
			<div class="article-subsection-l2">
				<h4>第 4 步：输出与拼接（Output and Concatenation）</h4>
				<p>
					模型拿掩码自注意力算出的分数去乘 <span class="v-color">Value</span>
					矩阵，就得到自注意力机制的
					<span class="purple-color">最终输出</span>。GPT-2 有 <code>12</code>
					个自注意力头，每个头抓住词元之间不同的关系。把这些头的输出拼接起来，再通过一个线性投影变换，就完成了。
				</p>
			</div>
		</div>

		<div class="article-section" id="article-activation" data-click="article-mlp">
			<h3>MLP：多层感知机</h3>

			<div class="figure">
				<img src="./article_assets/mlp.png" width="70%" alt="多层感知机（MLP）结构示意图" />
			</div>
			<div class="figure-caption">
				图 <span class="attention">4</span>。用 MLP
				层把自注意力的表示投影到更高维的空间，增强模型的表达能力。
			</div>

			<p>
				自注意力的多个头抓住输入词元之间的各种关系之后，拼接起来的输出会送进
				MLP（多层感知机）层，用来增强模型的表达能力。MLP 由两次线性变换组成，中间夹着一个
				<a
					href="https://en.wikipedia.org/wiki/Rectified_linear_unit#Gaussian-error_linear_unit_(GELU)"
					>GELU</a
				>
				激活函数。
			</p>
			<p>
				第一次线性变换把输入的维度扩大四倍，从 <code>768</code>
				变成
				<code>3072</code
				>。这一步让模型把词元的表示投影到更高维的空间，从而看到原维度里看不出的、更丰富也更复杂的模式。
			</p>
			<p>
				第二次线性变换再把维度压回原来的 <code>768</code
				>。这一步在保留扩展阶段引入的有用非线性变换的同时，把表示收回到一个可控的大小。
			</p>
			<p>
				自注意力是在词元之间交换信息，MLP
				不一样，它对每个词元单独处理，只是把每个词元的表示从一个空间映射到另一个空间，从而提升整个模型的能力。
			</p>
		</div>

		<div class="article-section" id="article-prob" data-click="article-prob">
			<h2>输出概率</h2>
			<p>
				输入经过所有 Transformer
				块处理完之后，输出会送进最后的线性层，为预测下一个词元做准备。这一层把最终的表示投影到
				<code>50,257</code>
				维的空间，词表里的每个词元都会得到一个对应的数值，叫做
				<code>logit</code
				>（原始分数）。任何一个词元都可能是下一个词，所以只要按可能性给这些词元排个序就行。然后我们用
				Softmax（把分数变成概率）把原始分数变成总和为 1
				的概率分布。这样就能按可能性来采样下一个词元了。
			</p>

			<div class="figure py-5">
				<img
					src="./article_assets/softmax.png"
					width="70%"
					alt="Softmax 将模型输出分数转换为词元概率的示意图"
				/>
			</div>
			<div class="figure-caption">
				图 <span class="attention">5</span
				>。词表里的每个词元都会根据模型输出的原始分数得到一个概率。这些概率决定了每个词元成为序列中下一个词的可能性。
			</div>

			<p id="article-temperature" data-click="article-temperature">
				最后一步，是从这个分布里采样，生成下一个词元。温度（<code>temperature</code
				>）这个超参数在这一步非常关键。数学上的操作其实很简单：把模型输出的原始分数直接除以
				<code>temperature</code>：
			</p>

			<ul>
				<li>
					<code>temperature = 1</code>：除以 1 不会影响结果，Softmax 的输出和原来一样。
				</li>
				<li>
					<code>temperature &lt; 1</code
					>：温度调低，概率分布会变得更尖锐，模型更自信、更确定，输出也更可预测。
				</li>
				<li>
					<code>temperature &gt; 1</code
					>：温度调高，概率分布会变得更平缓，生成的文字更随机——有人把这叫做模型的<em>“创造力”</em>。
				</li>
			</ul>

			<p id="article-sampling" data-click="article-sampling">
				另外，采样过程还可以用 <code>top-k</code>
				和
				<code>top-p</code> 这两个参数进一步调整：
			</p>
			<ul>
				<li>
					<code>Top-k 采样</code>：只从概率最高的前 k 个词元里挑，把可能性太低的选项过滤掉。
				</li>
				<li>
					<code>Top-p 采样</code>：按概率从小到大累加，取累计概率刚好超过阈值 p
					的那一小撮词元，这样既只保留最可能的词元，又保留了多样性。
				</li>
			</ul>
			<p>
				调一调 <code>temperature</code>、<code>top-k</code> 和
				<code>top-p</code>，你就能在“稳定”和“多样”之间找到平衡，让模型的表现更符合你的需要。
			</p>
		</div>

		<div class="article-section" data-click="article-advanced-features">
			<h2>辅助性的结构设计</h2>

			<p>
				还有一些辅助性的结构设计，能让 Transformer
				模型表现得更好。它们对模型的整体性能很重要，但对理解架构的核心概念来说没那么关键。层归一化（layer
				normalization）、随机丢弃（dropout）和残差连接（residual connection）是 Transformer
				里的重要组件，尤其在训练阶段很关键。层归一化让训练更稳定，帮助模型更快收敛；随机丢弃会在训练时随机让一部分神经元失效，防止过拟合；残差连接让梯度可以直接流过网络，缓解梯度消失的问题。
			</p>
			<div class="article-subsection" id="article-ln">
				<h3>层归一化（Layer Normalization）</h3>

				<p>
					层归一化让训练过程更稳定，收敛得也更好。它的做法是对各个特征做归一化，让激活值的均值和方差保持稳定。这样能缓解内部协变量偏移（internal
					covariate shift）带来的麻烦，让模型学得更有效，也不那么依赖初始权重。每个 Transformer
					块里会做两次层归一化：一次在自注意力之前，一次在 MLP 层之前。
				</p>
			</div>
			<div class="article-subsection" id="article-dropout">
				<h3>随机丢弃（Dropout）</h3>

				<p>
					随机丢弃是一种正则化方法，用来防止神经网络过拟合：训练时随机把一部分模型权重设成
					0。这样模型就不会过度依赖某些特定神经元，学到的特征更稳健，也更容易泛化到没见过的新数据上。到了模型推理的时候，随机丢弃会被关掉。这相当于我们用的是一大堆训练过的子网络的组合，所以模型表现更好。
				</p>
			</div>
			<div class="article-subsection" id="article-residual">
				<h3>残差连接（Residual Connections）</h3>

				<p>
					残差连接最早出现在 2015 年的 ResNet
					模型里。这个结构上的创新改变了深度学习：人们终于能训练非常深的神经网络了。简单说，残差连接就是一条“近道”，跨过一层或多层，把某一层的输入直接加到它的输出上。它能缓解梯度消失问题，让一层层叠起来的深层
					Transformer 更容易训练。在 GPT-2 里，每个 Transformer 块中会用到两次残差连接：一次在 MLP
					之前，一次在之后，这样梯度流动更顺畅，靠前的层在反向传播时也能得到足够的更新。
				</p>
			</div>
		</div>

		<div class="article-section" data-click="article-interactive-features">
			<h1>互动功能</h1>
			<p>
				Transformer Explainer 生来就是一个可以动手玩的可视化工具，让你探索 Transformer
				内部的运作。下面这些互动功能都可以试一试：
			</p>

			<ul>
				<li>
					<strong>输入你自己的句子</strong
					>，看看模型怎么处理它、怎么预测下一个词。你可以查看注意力权重、中间的每一步计算，以及最终输出概率是怎么算出来的。
				</li>
				<li>
					<strong>拖动温度滑块</strong
					>，控制模型预测的随机程度。改一改温度值，看看怎么让输出变得更确定或者更有创意。
				</li>
				<li>
					<strong>选择 Top-k 和 Top-p 采样方法</strong
					>，调整推理时的采样行为。试试不同的取值，观察概率分布怎么变化，以及它如何影响模型的预测。
				</li>
				<li>
					<strong>和注意力图互动</strong
					>，看看模型把注意力放在输入句子的哪些词元上。把鼠标停在词元上就能高亮它们的注意力权重，顺便探索模型是怎么抓住上下文和词与词之间关系的。
				</li>
			</ul>
		</div>

		<div class="article-section" data-click="article-video">
			<h2>视频教程</h2>
			<p>
				<a href="https://www.youtube.com/watch?v=ECR4oAwocjs" target="_blank" rel="noreferrer">
					到 YouTube 上观看视频教程（需要联网）。
				</a>
			</p>
		</div>

		<div class="article-section" data-click="article-implementation">
			<h2>Transformer Explainer 是怎么实现的？</h2>
			<p>
				Transformer Explainer 在浏览器里直接跑一个实时的 GPT-2（small）模型。这个模型改自 Andrej
				Karpathy 的
				<a href="https://github.com/karpathy/nanoGPT" title="Github" target="_blank">nanoGPT 项目</a
				>
				（GPT 的 PyTorch 实现），并转换成了
				<a href="https://onnxruntime.ai/" title="ONNX" target="_blank">ONNX Runtime</a>
				格式，好在浏览器里顺畅运行。界面用 JavaScript 编写，前端框架是
				<a href="https://kit.svelte.dev/" title="Svelte" target="_blank">Svelte</a>，动态可视化用
				<a href="https://d3js.org/" title="D3" target="_blank">D3.js</a> 完成。所有数值都会跟着你的输入实时更新。
			</p>
		</div>

		<div class="article-section" data-click="article-credit">
			<h2>Transformer Explainer 是谁开发的？</h2>
			<p>
				Transformer Explainer 由 Georgia Institute of Technology（佐治亚理工学院）的

				<a href="https://aereeeee.github.io/" target="_blank">Aeree Cho</a>、
				<a href="https://www.linkedin.com/in/chaeyeonggracekim/" target="_blank">Grace C. Kim</a>、
				<a href="https://alexkarpekov.com/" target="_blank">Alexander Karpekov</a>、
				<a href="https://alechelbling.com/" target="_blank">Alec Helbling</a>、
				<a href="https://zijie.wang/" target="_blank">Jay Wang</a>、
				<a href="https://seongmin.xyz/" target="_blank">Seongmin Lee</a>、
				<a href="https://bhoov.com/" target="_blank">Benjamin Hoover</a> 和
				<a href="https://poloclub.github.io/polochau/" target="_blank">Polo Chau</a>

				共同开发。
			</p>
		</div>
	</div>
{:else}
	<div id="description">
		<div class="article-section" data-click="article-intro">
			<h1>What is a Transformer?</h1>

			<p>
				Transformer is a neural network architecture that has fundamentally changed the approach to
				Artificial Intelligence. Transformer was first introduced in the seminal paper
				<a
					href="https://dl.acm.org/doi/10.5555/3295222.3295349"
					title="ACM Digital Library"
					target="_blank">"Attention is All You Need"</a
				>
				in 2017 and has since become the go-to architecture for deep learning models, powering text-generative
				models like OpenAI's <strong>GPT</strong>, Meta's <strong>Llama</strong>, and Google's
				<strong>Gemini</strong>. Beyond text, Transformer is also applied in
				<a
					href="https://huggingface.co/learn/audio-course/en/chapter3/introduction"
					title="Hugging Face"
					target="_blank">audio generation</a
				>,
				<a
					href="https://huggingface.co/learn/computer-vision-course/unit3/vision-transformers/vision-transformers-for-image-classification"
					title="Hugging Face"
					target="_blank">image recognition</a
				>,
				<a href="https://elifesciences.org/articles/82819" title="eLife"
					>protein structure prediction</a
				>, and even
				<a
					href="https://www.deeplearning.ai/the-batch/reinforcement-learning-plus-transformers-equals-efficiency/"
					title="Deep Learning AI"
					target="_blank">game playing</a
				>, demonstrating its versatility across numerous domains.
			</p>
			<p>
				Fundamentally, text-generative Transformer models operate on the principle of <strong
					>next-token prediction</strong
				>: given a text prompt from the user, what is the
				<em>most probable next token (a word or part of a word)</em> that will follow this input? The
				core innovation and power of Transformers lie in their use of self-attention mechanism, which
				allows them to process entire sequences and capture long-range dependencies more effectively
				than previous architectures.
			</p>
			<p>
				GPT-2 family of models are prominent examples of text-generative Transformers. Transformer
				Explainer is powered by the
				<a href="https://huggingface.co/openai-community/gpt2" title="Hugging Face" target="_blank"
					>GPT-2</a
				>
				(small) model which has 124 million parameters. While it is not the latest or most powerful Transformer
				model, it shares many of the same architectural components and principles found in the current
				state-of-the-art models making it an ideal starting point for understanding the basics.
			</p>
		</div>

		<div class="article-section" data-click="article-overview">
			<h1>Transformer Architecture</h1>

			<p>
				Every text-generative Transformer consists of these <strong>three key components</strong>:
			</p>
			<ol>
				<li>
					<strong class="bold-purple">Embedding</strong>: Text input is divided into smaller units
					called tokens, which can be words or subwords. These tokens are converted into numerical
					vectors called embeddings, which capture the semantic meaning of words.
				</li>
				<li>
					<strong class="bold-purple">Transformer Block</strong> is the fundamental building block
					of the model that processes and transforms the input data. Each block includes:
					<ul class="">
						<li>
							<strong>Attention Mechanism</strong>, the core component of the Transformer block. It
							allows tokens to communicate with other tokens, capturing contextual information and
							relationships between words.
						</li>
						<li>
							<strong>MLP (Multilayer Perceptron) Layer</strong>, a feed-forward network that
							operates on each token independently. While the goal of the attention layer is to
							route information between tokens, the goal of the MLP is to refine each token's
							representation.
						</li>
					</ul>
				</li>
				<li>
					<strong class="bold-purple">Output Probabilities</strong>: The final linear and softmax
					layers transform the processed embeddings into probabilities, enabling the model to make
					predictions about the next token in a sequence.
				</li>
			</ol>
		</div>

		<div class="article-section" id="embedding" data-click="article-embedding">
			<h2>Embedding</h2>
			<p>
				Let's say you want to generate text using a Transformer model. You add the prompt like this
				one: <code>“Data visualization empowers users to”</code>. This input needs to be converted
				into a format that the model can understand and process. That is where embedding comes in:
				it transforms the text into a numerical representation that the model can work with. To
				convert a prompt into embedding, we need to 1) tokenize the input, 2) obtain token
				embeddings, 3) add positional information, and finally 4) add up token and position
				encodings to get the final embedding. Let’s see how each of these steps is done.
			</p>
			<div class="figure">
				<img
					src="./article_assets/embedding.png"
					width="65%"
					alt="Diagram of the Transformer input embedding process."
				/>
			</div>
			<div class="figure-caption">
				Figure <span class="attention">1</span>. Expanding the Embedding layer view, showing how the
				input prompt is converted to a vector representation. The process involves
				<span class="fig-numbering">(1)</span> Tokenization, (2) Token Embedding, (3) Positional Encoding,
				and (4) Final Embedding.
			</div>
			<div class="article-subsection">
				<h3>Step 1: Tokenization</h3>
				<p>
					Tokenization is the process of breaking down the input text into smaller, more manageable
					pieces called tokens. These tokens can be a word or a subword. The words <code
						>"Data"</code
					>
					and <code>"visualization"</code> correspond to unique tokens, while the word
					<code>"empowers"</code>
					is split into two tokens. The full vocabulary of tokens is decided before training the model:
					GPT-2's vocabulary has <code>50,257</code> unique tokens. Now that we split our input text
					into tokens with distinct IDs, we can obtain their vector representation from embeddings.
				</p>
			</div>
			<div class="article-subsection" id="article-token-embedding">
				<h3>Step 2. Token Embedding</h3>
				<p>
					GPT-2 (small) represents each token in the vocabulary as a 768-dimensional vector; the
					dimension of the vector depends on the model. These embedding vectors are stored in a
					matrix of shape <code>(50,257, 768)</code>, containing approximately 39 million
					parameters! This extensive matrix allows the model to assign semantic meaning to each
					token, in the sense that tokens with similar usage or meaning in language are placed close
					together in this high-dimensional space, while dissimilar tokens are farther apart.
				</p>
			</div>
			<div class="article-subsection" id="article-positional-embedding">
				<h3>Step 3. Positional Encoding</h3>
				<p>
					The Embedding layer also encodes information about each token's position in the input
					prompt. Different models use various methods for positional encoding. GPT-2 trains its own
					positional encoding matrix from scratch, integrating it directly into the training
					process.
				</p>

				<!-- <div class="article-subsection-l2">
	<h4>Alternative Positional Encoding Approach <strong class='attention'>[POTENTIALLY COLLAPSIBLE]</strong></h4>
	<p>
	  Other models, like the original Transformer and BERT,
	  use sinusoidal functions for positional encoding.

	  This sinusoidal encoding is deterministic and designed to reflect
	  the absolute as well as the relative position of each token.
	</p>
	<p>
	  Each position in a sequence is assigned a unique mathematical
	  representation using a combination of sine and cosine functions.

	  For a given position, the sine function represents even dimensions,
	  and the cosine function represents odd dimensions within the positional encoding vector.

	  This periodic nature ensures that each position has a consistent encoding,
	  independent of the surrounding context.
	</p>

	<p>
	  Here’s how it works:
	</p>

	<span class='attention'>
	  SINUSOIDAL POSITIONAL ENCODING EQUATION
	</span>

	<ul>
	  <li>
		<strong>Sine Function</strong>: Used for even indices of the embedding vector.
	  </li>
	  <li>
		<strong>Cosine Function</strong>: Used for odd indices of the embedding vector.
	</ul>

	<p>
	  Hover over individual encoding values in the matrix above to
	  see how it's calculated using the sins and cosine functions.
	</p>
  </div> -->
			</div>
			<div class="article-subsection">
				<h3>Step 4. Final Embedding</h3>
				<p>
					Finally, we sum the token and positional encodings to get the final embedding
					representation. This combined representation captures both the semantic meaning of the
					tokens and their position in the input sequence.
				</p>
			</div>
		</div>

		<div class="article-section" data-click="article-transformer-block">
			<h2>Transformer Block</h2>

			<p>
				The core of the Transformer's processing lies in the Transformer block, which comprises
				multi-head self-attention and a Multi-Layer Perceptron layer. Most models consist of
				multiple such blocks that are stacked sequentially one after the other. The token
				representations evolve through layers, from the first block to the last one, allowing the
				model to build up an intricate understanding of each token. This layered approach leads to
				higher-order representations of the input. The GPT-2 (small) model we are examining consists
				of <code>12</code> such blocks.
			</p>
		</div>

		<div class="article-section" id="self-attention" data-click="article-attention">
			<h3>Multi-Head Self-Attention</h3>
			<p>
				The self-attention mechanism enables the model to capture relationships among tokens in a
				sequence, so that each token’s representation is influenced by the others. Multiple
				attention heads allow the model to consider these relationships from different perspectives;
				for example, one head may capture short-range syntactic links while another tracks broader
				semantic context. In the following section, we will walk through how multi-head
				self-attention is computed step by step.
			</p>
			<div class="article-subsection-l2">
				<h4>Step 1: Query, Key, and Value Matrices</h4>

				<div class="figure pt-10">
					<img
						src="./article_assets/QKV.png"
						width="80%"
						alt="Diagram showing how Query, Key, and Value vectors are computed."
					/>
					<div class="text-xs">
						<Katex
							displayMode
							math={`
		QKV_{ij} = ( \\sum_{d=1}^{768} \\text{Embedding}_{i,d} \\cdot \\text{Weights}_{d,j}) + \\text{Bias}_j
		`}
						/>
					</div>
				</div>
				<div class="figure-caption">
					Figure <span class="attention">2</span>. Computing Query, Key, and Value matrices from the
					original embedding.
				</div>

				<p>
					Each token's embedding vector is transformed into three vectors:
					<span class="q-color">Query (Q)</span>,
					<span class="k-color">Key (K)</span>, and
					<span class="v-color">Value (V)</span>. These vectors are derived by multiplying the input
					embedding matrix with learned weight matrices for
					<span class="q-color">Q</span>,
					<span class="k-color">K</span>, and
					<span class="v-color">V</span>. Here's a web search analogy to help us build some
					intuition behind these matrices:
				</p>
				<ul>
					<li>
						<strong class="q-color font-medium">Query (Q)</strong> is the search text you type in
						the search engine bar. This is the token you want to
						<em>"find more information about"</em>.
					</li>
					<li>
						<strong class="k-color font-medium">Key (K)</strong> is the title of each web page in the
						search result window. It represents the possible tokens the query can attend to.
					</li>
					<li>
						<strong class="v-color font-medium">Value (V)</strong> is the actual content of web pages
						shown. Once we matched the appropriate search term (Query) with the relevant results (Key),
						we want to get the content (Value) of the most relevant pages.
					</li>
				</ul>
				<p>
					By using these QKV values, the model can calculate attention scores, which determine how
					much focus each token should receive when generating predictions.
				</p>
			</div>
			<div class="article-subsection-l2">
				<h4>Step 2: Multi-Head Splitting</h4>
				<p>
					<span class="q-color">Query</span>, <span class="k-color">key</span>, and
					<span class="v-color">Value</span>
					vectors are split into multiple heads—in GPT-2 (small)'s case, into
					<code>12</code> heads. Each head processes a segment of the embeddings independently, capturing
					different syntactic and semantic relationships. This design facilitates parallel learning of
					diverse linguistic features, enhancing the model's representational power.
				</p>
			</div>
			<div class="article-subsection-l2">
				<h4>Step 3: Masked Self-Attention</h4>
				<p>
					In each head, we perform masked self-attention calculations. This mechanism allows the
					model to generate sequences by focusing on relevant parts of the input while preventing
					access to future tokens.
				</p>

				<div class="figure">
					<img
						src="./article_assets/attention.png"
						width="80%"
						alt="Diagram of masked self-attention calculation."
					/>
				</div>
				<div class="figure-caption">
					Figure <span class="attention">3</span>. Using Query, Key, and Value matrices to calculate
					masked self-attention.
				</div>

				<ul>
					<li>
						<strong>Dot Product</strong>: The dot product of
						<span class="q-color">Query</span>
						and <span class="k-color">Key</span> matrices determines the
						<strong>attention score</strong>, producing a square matrix that reflects the
						relationship between all input tokens.
					</li>
					<li>
						<strong>Scaling · Mask</strong>: The attention scores are scaled and a mask is applied
						to the upper triangle of the attention matrix to prevent the model from accessing future
						tokens, setting these values to negative infinity. The model needs to learn how to
						predict the next token without “peeking” into the future.
					</li>
					<li>
						<strong>Softmax · Dropout</strong>: After masking and scaling, the attention scores are
						converted into probabilities by the softmax operation, then optionally regularized with
						dropout. Each row of the matrix sums to one and indicates the relevance of every other
						token to the left of it.
					</li>
				</ul>
			</div>
			<div class="article-subsection-l2">
				<h4>Step 4: Output and Concatenation</h4>
				<p>
					The model uses the masked self-attention scores and multiplies them with the
					<span class="v-color">Value</span> matrix to get the
					<span class="purple-color">final output</span>
					of the self-attention mechanism. GPT-2 has <code>12</code> self-attention heads, each capturing
					different relationships between tokens. The outputs of these heads are concatenated and passed
					through a linear projection.
				</p>
			</div>
		</div>

		<div class="article-section" id="article-activation" data-click="article-mlp">
			<h3>MLP: Multi-Layer Perceptron</h3>

			<div class="figure">
				<img src="./article_assets/mlp.png" width="70%" alt="Diagram of the MLP layer." />
			</div>
			<div class="figure-caption">
				Figure <span class="attention">4</span>. Using MLP layer to project the self-attention
				representations into higher dimensions to enhance the model's representational capacity.
			</div>

			<p>
				After the multiple heads of self-attention capture the diverse relationships between the
				input tokens, the concatenated outputs are passed through the Multilayer Perceptron (MLP)
				layer to enhance the model's representational capacity. The MLP block consists of two linear
				transformations with a <a
					href="https://en.wikipedia.org/wiki/Rectified_linear_unit#Gaussian-error_linear_unit_(GELU)"
					>GELU</a
				> activation function in between.
			</p>
			<p>
				The first linear transformation expands the dimensionality of the input four-fold from <code
					>768</code
				>
				to
				<code>3072</code>. This expansion step allows the model to project the token representations
				into a higher-dimensional space, where it can capture richer and more complex patterns that
				may not be visible in the original dimension.
			</p>
			<p>
				The second linear transformation then reduces the dimensionality back to the original size
				of <code>768</code>.This compression step brings the representations back to a manageable
				size while retaining the useful nonlinear transformations introduced in the expansion step.
			</p>
			<p>
				Unlike the self-attention mechanism, which integrates information across tokens, the MLP
				processes tokens independently and simply maps each token representation from one space to
				another, enriching the overall model capacity.
			</p>
		</div>

		<div class="article-section" id="article-prob" data-click="article-prob">
			<h2>Output Probabilities</h2>
			<p>
				After the input has been processed through all Transformer blocks, the output is passed
				through the final linear layer to prepare it for token prediction. This layer projects the
				final representations into a <code>50,257</code>
				dimensional space, where every token in the vocabulary has a corresponding value called
				<code>logit</code>. Any token can be the next word, so this process allows us to simply rank
				these tokens by their likelihood of being that next word. We then apply the softmax function
				to convert the logits into a probability distribution that sums to one. This will allow us
				to sample the next token based on its likelihood.
			</p>

			<div class="figure py-5">
				<img
					src="./article_assets/softmax.png"
					width="70%"
					alt="Diagram showing how softmax converts model output scores into token probabilities."
				/>
			</div>
			<div class="figure-caption">
				Figure <span class="attention">5</span>. Each token in the vocabulary is assigned a
				probability based on the model's output logits. These probabilities determine the likelihood
				of each token being the next word in the sequence.
			</div>

			<p id="article-temperature" data-click="article-temperature">
				The final step is to generate the next token by sampling from this distribution The <code
					>temperature</code
				>
				hyperparameter plays a critical role in this process. Mathematically speaking, it is a very simple
				operation: model output logits are simply divided by the
				<code>temperature</code>:
			</p>

			<ul>
				<li>
					<code>temperature = 1</code>: Dividing logits by one has no effect on the softmax outputs.
				</li>
				<li>
					<code>temperature &lt; 1</code>: Lower temperature makes the model more confident and
					deterministic by sharpening the probability distribution, leading to more predictable
					outputs.
				</li>
				<li>
					<code>temperature &gt; 1</code>: Higher temperature creates a softer probability
					distribution, allowing for more randomness in the generated text – what some refer to as
					model <em>“creativity”</em>.
				</li>
			</ul>

			<p id="article-sampling" data-click="article-sampling">
				In addition, the sampling process can be further refined using <code>top-k</code>
				and
				<code>top-p</code> parameters:
			</p>
			<ul>
				<li>
					<code>top-k sampling</code>: Limits the candidate tokens to the top k tokens with the
					highest probabilities, filtering out less likely options.
				</li>
				<li>
					<code>top-p sampling</code>: Considers the smallest set of tokens whose cumulative
					probability exceeds a threshold p, ensuring that only the most likely tokens contribute
					while still allowing for diversity.
				</li>
			</ul>
			<p>
				By tuning <code>temperature</code>, <code>top-k</code>, and <code>top-p</code>, you can
				balance between deterministic and diverse outputs, tailoring the model's behavior to your
				specific needs.
			</p>
		</div>

		<div class="article-section" data-click="article-advanced-features">
			<h2>Auxiliary Architectural Features</h2>

			<p>
				There are several auxiliary architectural features that enhance the performance of
				Transformer models. While important for the model's overall performance, they are not as
				important for understanding the core concepts of the architecture. Layer Normalization,
				Dropout, and Residual Connections are crucial components in Transformer models, particularly
				during the training phase. Layer Normalization stabilizes training and helps the model
				converge faster. Dropout prevents overfitting by randomly deactivating neurons. Residual
				Connections allows gradients to flow directly through the network and helps to prevent the
				vanishing gradient problem.
			</p>
			<div class="article-subsection" id="article-ln">
				<h3>Layer Normalization</h3>

				<p>
					Layer Normalization helps to stabilize the training process and improves convergence. It
					works by normalizing the inputs across the features, ensuring that the mean and variance
					of the activations are consistent. This normalization helps mitigate issues related to
					internal covariate shift, allowing the model to learn more effectively and reducing the
					sensitivity to the initial weights. Layer Normalization is applied twice in each
					Transformer block, once before the self-attention mechanism and once before the MLP layer.
				</p>
			</div>
			<div class="article-subsection" id="article-dropout">
				<h3>Dropout</h3>

				<p>
					Dropout is a regularization technique used to prevent overfitting in neural networks by
					randomly setting a fraction of model weights to zero during training. This encourages the
					model to learn more robust features and reduces dependency on specific neurons, helping
					the network generalize better to new, unseen data. During model inference, dropout is
					deactivated. This essentially means that we are using an ensemble of the trained
					subnetworks, which leads to a better model performance.
				</p>
			</div>
			<div class="article-subsection" id="article-residual">
				<h3>Residual Connections</h3>

				<p>
					Residual connections were first introduced in the ResNet model in 2015. This architectural
					innovation revolutionized deep learning by enabling the training of very deep neural
					networks. Essentially, residual connections are shortcuts that bypass one or more layers,
					adding the input of a layer to its output. This helps mitigate the vanishing gradient
					problem, making it easier to train deep networks with multiple Transformer blocks stacked
					on top of each other. In GPT-2, residual connections are used twice within each
					Transformer block: once before the MLP and once after, ensuring that gradients flow more
					easily, and earlier layers receive sufficient updates during backpropagation.
				</p>
			</div>
		</div>

		<div class="article-section" data-click="article-interactive-features">
			<h1>Interactive Features</h1>
			<p>
				Transformer Explainer is built to be interactive and allows you to explore the inner
				workings of the Transformer. Here are some of the interactive features you can play with:
			</p>

			<ul>
				<li>
					<strong>Input your own text sequence</strong> to see how the model processes it and predicts
					the next word. Explore attention weights, intermediate computations, and see how the final
					output probabilities are calculated.
				</li>
				<li>
					<strong>Use temperature slider</strong> to control the randomness of the model’s predictions.
					Explore how you can make the model output more deterministic or more creative by changing the
					temperature value.
				</li>
				<li>
					<strong>Select top-k and top-p sampling methods</strong> to adjust sampling behavior during
					inference. Experiment with different values and see how the probability distribution changes
					and influences the model's predictions.
				</li>
				<li>
					<strong>Interact with attention maps</strong> to see how the model focuses on different tokens
					in the input sequence. Hover over tokens to highlight their attention weights and explore how
					the model captures context and relationships between words.
				</li>
			</ul>
		</div>

		<div class="article-section" data-click="article-video">
			<h2>Video Tutorial</h2>
			<p>
				<a href="https://www.youtube.com/watch?v=ECR4oAwocjs" target="_blank" rel="noreferrer">
					Watch the video tutorial on YouTube (requires internet).
				</a>
			</p>
		</div>

		<div class="article-section" data-click="article-implementation">
			<h2>How is Transformer Explainer Implemented?</h2>
			<p>
				Transformer Explainer features a live GPT-2 (small) model running directly in the browser.
				This model is derived from the PyTorch implementation of GPT by Andrej Karpathy's
				<a href="https://github.com/karpathy/nanoGPT" title="Github" target="_blank"
					>nanoGPT project</a
				>
				and has been converted to
				<a href="https://onnxruntime.ai/" title="ONNX" target="_blank">ONNX Runtime</a>
				for seamless in-browser execution. The interface is built using JavaScript, with
				<a href="https://kit.svelte.dev/" title="Svelte" target="_blank">Svelte</a>
				as a front-end framework and
				<a href="https://d3js.org/" title="D3" target="_blank">D3.js</a>
				for creating dynamic visualizations. Numerical values are updated live following the user input.
			</p>
		</div>

		<div class="article-section" data-click="article-credit">
			<h2>Who developed the Transformer Explainer?</h2>
			<p>
				Transformer Explainer was created by

				<a href="https://aereeeee.github.io/" target="_blank">Aeree Cho</a>,
				<a href="https://www.linkedin.com/in/chaeyeonggracekim/" target="_blank">Grace C. Kim</a>,
				<a href="https://alexkarpekov.com/" target="_blank">Alexander Karpekov</a>,
				<a href="https://alechelbling.com/" target="_blank">Alec Helbling</a>,
				<a href="https://zijie.wang/" target="_blank">Jay Wang</a>,
				<a href="https://seongmin.xyz/" target="_blank">Seongmin Lee</a>,
				<a href="https://bhoov.com/" target="_blank">Benjamin Hoover</a>, and
				<a href="https://poloclub.github.io/polochau/" target="_blank">Polo Chau</a>

				at the Georgia Institute of Technology.
			</p>
		</div>
	</div>
{/if}

<style lang="scss">
	a {
		color: theme('colors.blue.500');

		&:hover {
			color: theme('colors.blue.700');
		}
	}

	.bold-purple {
		color: theme('colors.purple.700');
		font-weight: bold;
	}

	code {
		color: theme('colors.gray.500');
		background-color: theme('colors.gray.50');
		font-family: theme('fontFamily.mono');
	}

	.q-color {
		color: theme('colors.blue.400');
	}

	.k-color {
		color: theme('colors.red.400');
	}

	.v-color {
		color: theme('colors.green.400');
	}

	.purple-color {
		color: theme('colors.purple.500');
	}

	.article-section {
		padding-bottom: 2rem;
	}
	#description {
		padding-bottom: 3rem;
		margin-left: auto;
		margin-right: auto;
		max-width: 78ch;
	}

	#description h1 {
		color: theme('colors.purple.700');
		font-size: 2.2rem;
		font-weight: 300;
		padding-top: 1rem;
	}

	#description h2 {
		// color: #444;
		color: theme('colors.purple.700');
		font-size: 2rem;
		font-weight: 300;
		padding-top: 1rem;
	}

	#description h3 {
		color: theme('colors.gray.700');
		font-size: 1.6rem;
		font-weight: 200;
		padding-top: 1rem;
	}

	#description h4 {
		color: theme('colors.gray.700');
		font-size: 1.6rem;
		font-weight: 200;
		padding-top: 1rem;
	}

	#description p {
		margin: 1rem 0;
	}

	#description .figure-caption {
		font-size: 0.8rem;
		margin-top: 0.5rem;
		text-align: center;
		margin-bottom: 2rem;
	}

	#description ol {
		margin-left: 3rem;
		list-style-type: decimal;
	}

	#description li {
		margin: 0.6rem 0;
	}

	#description p,
	#description div,
	#description li {
		color: theme('colors.gray.600');
		line-height: 1.6;
	}

	#description ul {
		list-style-type: disc;
		margin-left: 2.5rem;
		margin-bottom: 1rem;
	}

	#description a:hover {
		text-decoration: underline;
	}

	.figure {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
