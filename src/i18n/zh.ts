import type { MessageKey } from './en';

export const zh: Record<MessageKey, string> = {
	// Browser tab / share metadata
	'meta.title': 'Transformer Explainer：图解大语言模型（LLM）里的 Transformer',
	'meta.description':
		'一个交互式可视化工具，带你看懂 GPT 这类大语言模型（LLM）中的 Transformer 是怎么工作的。',

	// Language switch
	'lang.switch': '切换语言',
	'lang.zh': '中文',
	'lang.en': 'EN',

	// Input area
	'input.examples': '示例',
	'input.placeholder': '输入你自己想测试的文字',
	'input.helper.mobile': '可以先试试示例。想直接输入 GPT-2 提示词，请用电脑操作。',
	'input.helper.loading': '本地 GPT-2 模型（626MB）正在加载，加载期间可以先试试示例',
	'input.helper.wordLimit': '最多可以输入 {n} 个词。',
	'input.generate': '生成',

	// Startup progress and accessible control names
	'input.helper.tokenizer': '正在准备本地分词器…',
	'input.helper.reading': '正在读取本地模型：{completed}/{total}，可以先试试示例',
	'input.helper.initializing': '正在初始化本地模型，可以先试试示例',
	'input.helper.failed': '本地资源加载失败，请重新加载',
	'input.helper.inferenceError': '生成失败，可以再试一次',
	'error.retry': '重新加载',
	'error.inferenceTitle': '本地模型运算失败。',
	'error.inferenceHint': '可以缩短输入文字，然后再次生成。',
	'topbar.paper': '阅读研究论文',
	'topbar.video': '观看视频教程',
	'topbar.repository': '查看项目源码',
	'popover.finishAnimation': '完成动画',
	'popover.restartAnimation': '重新播放动画',
	'popover.close': '关闭',
	'popover.help': '帮助',
	'textbook.previousPage': '上一页',
	'textbook.nextPage': '下一页',
	'textbook.progress': '选择教科书页码',
	'textbook.pageCounter': '第 {current} 页，共 {total} 页',
	'textbook.openButton': '打开教科书',

	// Sliders
	'param.temperature': '温度',
	'param.sampling': '采样',

	// Visualization labels
	'viz.previousBlock': '上一个 Transformer 块',
	'viz.nextBlock': '下一个 Transformer 块',
	'viz.previousHead': '上一个注意力头',
	'viz.nextHead': '下一个注意力头',
	'viz.embedding': '嵌入',
	'viz.tokenization': '分词',
	'viz.tokenEmbedding': '词元嵌入',
	'viz.positionalEncoding': '位置编码',
	'viz.vectorSize': '向量({n})',
	'viz.id': '编号',
	'viz.position': '位置',
	'viz.query': 'Query',
	'viz.key': 'Key',
	'viz.value': 'Value',
	'viz.multiHeadSelfAttention': '多头自注意力',
	'viz.out': '输出',
	'viz.headOf': '第 {current} 头，共 {total} 头',
	'viz.queryVector': 'Query，第 {head} 头，向量({n})',
	'viz.keyVector': 'Key，第 {head} 头，向量({n})',
	'viz.valueVector': 'Value，第 {head} 头，向量({n})',
	'viz.mlp': 'MLP',
	'viz.dotProduct': '点积',
	'viz.scalingMask': '缩放 · 掩码',
	'viz.softmax': 'Softmax',
	'viz.attention': '注意力',
	'viz.probabilities': '概率',
	'viz.tokens': '词元',
	'viz.logits': '原始分数',
	'viz.scaledLogits': '缩放后的原始分数',
	'viz.normalization': '归一化',
	'viz.softmaxAndTopP': 'Softmax 与 Top-p',
	'viz.tokenId': '词元 ID：{id}',
	'viz.cumulativeSum': '累计={value}',
	'viz.gelu': 'GELU',
	'viz.dropout': 'Dropout',
	'viz.layerNorm': '层归一化',
	'viz.residual': '残差',

	// Hover tooltips on the flow diagram
	'sankey.tooltipQkv': '点击查看 QKV 的计算过程',
	'sankey.tooltipAttentionOut': '点击查看注意力输出的计算过程',
	'sankey.tooltipMlp': '点击查看 MLP 的处理过程',
	'sankey.tooltipLogits': '点击查看原始分数的计算过程',

	// Shared popover chrome
	'popover.readMore': '了解更多',
	'popover.openTextbook': '打开教科书',

	// Operation popovers
	'popover.gelu.title': 'GELU 激活',
	'popover.gelu.body': '把线性变换后的结果再做一次非线性变换，帮模型学会复杂的规律。',
	'popover.dropout.title': 'Dropout',
	'popover.dropout.body': '随机丢弃一部分神经元，只在训练时使用。',
	'popover.layerNorm.title': '层归一化',
	'popover.layerNorm.body': '把层的输入归一化，让数值分布更标准，训练和预测都更稳定。',
	'popover.residual.title': '残差连接',
	'popover.residual.body': '把层的输入加到输出上，帮助信息不丢失。',

	// Weight matrix popovers
	'popover.qkv.title': 'Query、Key、Value',
	'popover.qkv.weights': 'Q·K·V 权重',
	'popover.qkv.bias': 'Q·K·V 偏置',
	'popover.qkv.result': 'Q·K·V',
	'popover.qkv.embeddingsHelp': '嵌入来自词元，\n但会经过一个个块不断变化，\n慢慢变成抽象的表示。',
	'popover.qkv.weightsHelp':
		'把嵌入向量变换成 Query、Key、Value 三种向量。\n这些参数在训练中学到，预测时固定不变。',
	'popover.qkv.biasHelp': '变换之后再加上去的偏移量。\n这些参数在训练中学到，预测时固定不变。',
	'popover.attention.title': '注意力头 {head} 的输出',
	'popover.attention.attention': '注意力',
	'popover.value': 'Value',
	'popover.out': '输出',
	'popover.embeddings': '嵌入',
	'popover.mlpUp.title': 'MLP 扩张',
	'popover.expansionWeights': '扩张权重',
	'popover.expansionBias': '扩张偏置',
	'popover.expandedEmbeddings': '扩张后的<br />嵌入',
	'popover.expandedEmbeddingsPlain': '扩张后的嵌入',
	'popover.mlpUp.embeddingsHelp': '经过注意力机制处理后得到的嵌入。',
	'popover.mlpUp.weightsHelp':
		'把嵌入向量投影到更大的隐藏空间。\n这些参数在训练中学到，预测时固定不变。',
	'popover.mlpUp.biasHelp': '扩张之后再加上去的偏移量。\n这些参数在训练中学到，预测时固定不变。',
	'popover.mlpDown.title': 'MLP 压缩',
	'popover.compressionWeights': '压缩权重',
	'popover.compressionBias': '压缩偏置',
	'popover.compressedEmbeddings': '压缩后的<br />嵌入',
	'popover.mlpDown.embeddingsHelp': '经过 MLP 扩张层后变大的隐藏向量。',
	'popover.mlpDown.weightsHelp':
		'把变大的隐藏向量投影回原来的空间。\n这些参数在训练中学到，预测时固定不变。',
	'popover.mlpDown.biasHelp': '压缩之后再加上去的偏移量。\n这些参数在训练中学到，预测时固定不变。',
	'popover.logits.title': '原始分数',
	'popover.outputEmbedding': '输出<br />嵌入',
	'popover.projectionWeights': '输出投影权重',
	'popover.projectionBias': '输出投影偏置',
	'popover.logits.embeddingsHelp':
		'经过所有块之后，\n最后一个词元的嵌入向量\n已经带上了前面每个词元\n提供的上下文信息。',
	'popover.logits.weightsHelp':
		'把最后的嵌入变成整个词表上的分布。\n这些参数在训练中学到，预测时固定不变。',
	'popover.logits.biasHelp': '变换之后再加上去的偏移量。\n这些参数在训练中学到，预测时固定不变。',
	'popover.logits.logitsHelp': '还没做 Softmax 之前，\n模型对词表里每个词元的偏好打分。',

	// Softmax popover
	'popover.softmax.title': '“{token}” 这个词元被采样到的概率',
	'popover.softmax.scaledLogit': '缩放后的原始分数',
	'popover.softmax.logit': '原始分数',
	'popover.softmax.temperature': '温度',
	'popover.softmax.softmax': 'Softmax',
	'popover.softmax.topKFiltering': 'Top-k 筛选',
	'popover.softmax.topPFiltering': 'Top-p 筛选',
	'popover.softmax.ifInTopK': '如果原始分数在 Top-{k} 之内',
	'popover.softmax.otherwise': '否则',
	'popover.softmax.ifCumulative': '如果累计概率 ≤ {p}',
	'popover.softmax.normalization': '归一化',

	// Positional encoding popover
	'popover.positional.token': '词元',
	'popover.positional.position': '位置',
	'popover.positional.embedding': '嵌入',
	'popover.positional.encodingMatrix': '编码矩阵',

	// Startup errors
	'error.title': '无法加载本地的 GPT-2 资源。',
	'error.hint': '请检查本地资源文件是否齐全，然后刷新这个页面。',

	// Consent alert
	'alert.collect': '我们会收集匿名数据用于研究。',
	'alert.learnMore': '了解更多',

	// Textbook card / navigation
	'textbook.aria': '教科书',

	// Textbook pages
	'textbook.what-is-transformer.title': '什么是 Transformer？',
	'textbook.what-is-transformer.content': `<p><strong>Transformer</strong> 是现代 AI 的核心结构，ChatGPT、Gemini 这些模型都靠它工作。它在 2017 年被提出，改变了 AI 处理信息的方式。同一套结构，既用来在海量数据上训练，也用来做预测、生成结果。这里我们用的是 GPT-2（small），它比新模型简单，但很适合用来学习基本原理。</p>`,
	'textbook.how-transformers-work.title': 'Transformer 怎么工作？',
	'textbook.how-transformers-work.content': `<p>Transformer 并不神奇，它只是一步一步地问自己：</p>
	<blockquote class="question">
		“跟在这段输入后面、最可能出现的下一个词是什么？”
	</blockquote>
	<p>这里我们来看看训练好的模型是怎么生成文字的。你可以自己写一段文字，或者直接用示例，然后点击 <strong>生成</strong>，就能看到整个过程。如果模型还没准备好，可以先试试别的 <strong>示例</strong>。</p>`,
	'textbook.transformer-architecture.title': 'Transformer 的结构',
	'textbook.transformer-architecture.content':
		'<p>Transformer 主要有三个部分：</p><div class="numbered-list"><div class="numbered-item"><span class="number-circle">1</span><div class="item-content"><strong>嵌入</strong>把文字变成数字。</div></div><div class="numbered-item"><span class="number-circle">2</span><div class="item-content"><strong>Transformer 块</strong>用自注意力把信息混合起来，再用 MLP 加工得更精细。</div></div><div class="numbered-item"><span class="number-circle">3</span><div class="item-content"><strong>概率</strong>决定每个词元成为下一个词元的可能性有多大。</div></div></div>',
	'textbook.embedding.title': '嵌入',
	'textbook.embedding.content': `<p>Transformer 使用文字之前，会先把它切成一个个小单元，再把每个单元表示成一串数字（向量）。这个过程叫<strong>嵌入</strong>，“嵌入”这个词既指这个过程，也指最后得到的那个向量。</p><p>在这个工具里，每个向量都画成一个长方形，把鼠标放上去就能看到它有多大。</p>`,
	'textbook.token-embedding.title': '词元嵌入',
	'textbook.token-embedding.content': `<p><strong>分词</strong>把输入的文字切成一个个词元，词元可能是一个词，也可能是词的一部分。GPT-2（small）的词表里有 50,257 个词元，每个词元都有自己的编号。</p><p>到了<strong>词元嵌入</strong>这一步，每个词元都会从一张很大的对照表里找到属于自己的、由 768 个数字组成的向量。这些向量是在训练中学出来的，用来尽量准确地表示每个词元的含义。</p>`,
	'textbook.positional-encoding.title': '位置编码',
	'textbook.positional-encoding.content': `<p>语言里，词的先后顺序很重要。<strong>位置编码</strong>会把每个词元在序列里的位置告诉模型。</p><p>GPT-2 的做法，是给词元的嵌入加上一份学到的位置嵌入；更新的模型可能用别的方法，比如 RoPE，它靠旋转某些向量来编码位置。这些方法的目的都一样：让模型看懂文字里的顺序。</p>`,
	'textbook.blocks.title': '重复的 Transformer 块',
	'textbook.blocks.content': `<p><strong>Transformer 块</strong>是模型里主要的工作单元，它由两部分组成：</p><ul><li><strong>多头自注意力</strong>——让词元之间交换信息</li><li><strong>MLP</strong>——把每个词元的细节加工得更好</li></ul><p>模型会把很多个块叠在一起，词元的表示每经过一个块就丰富一些。GPT-2（small）有 12 个这样的块。</p>`,
	'textbook.self-attention.title': '多头自注意力',
	'textbook.self-attention.content':
		'<p><strong>自注意力</strong>让模型判断：输入里哪些部分和每个词元最相关。这样它就能抓住含义和词与词之间的关系，就算两个词离得很远也没问题。</p><p>在<strong>多头</strong>形式下，模型会同时跑好几套注意力过程，每一套关注文字里不同的规律。</p>',
	'textbook.qkv.title': 'Query、Key、Value',
	'textbook.qkv.content': `
	<p>要做自注意力，每个词元的嵌入会先变成
  <span class="highlight">三个新的嵌入</span>——
  <span class="blue">Query</span>、
  <span class="red">Key</span> 和
  <span class="green">Value</span>。
  做法就是给每个词元嵌入乘上不同的权重、加上不同的偏置。这些参数（权重和偏置）都是通过训练优化出来的。</p>

<p>生成之后，<span class="blue">Query</span> 会和 <span class="red">Key</span> 比一比，看看彼此有多相关；再用这个相关程度去给 <span class="green">Value</span> 加权。</p>
`,
	'textbook.multi-head.title': '多头',
	'textbook.multi-head.content':
		'<p>得到 <span class="blue">Q</span>、<span class="red">K</span>、<span class="green">V</span> 三种嵌入之后，模型会把它们分成好几个<strong>头</strong>（GPT-2 small 里是 12 个）。每个头只处理自己那一份更小的 <span class="blue">Q</span>/<span class="red">K</span>/<span class="green">V</span>，关注文字里不同的规律，比如语法、含义，或者相隔较远的词之间的联系。</p><p>有了多个头，模型就能同时学到很多种关系，理解得更全面。</p>',
	'textbook.masked-self-attention.title': '带掩码的自注意力',
	'textbook.masked-self-attention.content': `<p>在每个头里，模型会决定每个词元该把多少注意力放在别的词元上：</p><ul><li><strong>点积</strong>——把 <span class="blue">Query</span>/<span class="red">Key</span> 向量里对应的数字相乘，再相加，得到<span class="purple">注意力分数</span>。</li><li><strong>掩码</strong>——把后面的词元遮住，不让它提前偷看。</li><li><strong>Softmax</strong>——把分数换成概率，每一行加起来等于 1，表示它把注意力放在了前面哪些词元上。</li></ul>`,
	'textbook.output-concatenation.title': '注意力输出与拼接',
	'textbook.output-concatenation.content':
		'<p>每个头都会<span class="highlight">用<span class="purple">注意力分数</span>给 <span class="green">Value</span> 嵌入加权，算出这个头的注意力输出</span>——也就是每个词元看过上下文之后更精细的表示。</p><p>GPT-2（small）有 12 个这样的输出，它们会被拼接成一个和原来一样大小的向量（768 个数字）。</p>',
	'textbook.mlp.title': 'MLP（多层感知机）',
	'textbook.mlp.content':
		'<p>注意力的输出会送进 <strong>MLP</strong> 加工，让词元的表示更精细。先是一个线性层，用学到的权重和偏置改变嵌入的数值和大小；接着非线性激活函数会决定每个数值能通过多少。</p><p>激活函数有很多种，GPT-2 用的是 <strong>GELU</strong>：小的数值只放过去一部分，大的数值基本原样通过，这样既能抓住细微的规律，也能抓住明显的规律。</p>',
	'textbook.output-logit.title': '输出的原始分数',
	'textbook.output-logit.content': `<p>走完所有 Transformer 块之后，最后一个词元的输出嵌入已经带上了前面所有词元的上下文信息，它会在最后一层里乘上学到的权重。</p><p>这样算出来的就是<strong>原始分数</strong>，一共 50,257 个数字，对应 GPT-2 词表里的每一个词元，表示每个词元接下来出现的可能性有多大。</p>`,
	'textbook.output-probabilities.title': '概率',
	'textbook.output-probabilities.content':
		'<p>原始分数只是还没处理的打分。为了更容易看懂，我们把它换成 0 到 1 之间的<strong>概率</strong>，而且所有概率加起来正好等于 1。这样就能知道每个词元成为下一个词的可能性有多大。</p><p>我们不一定每次都挑概率最高的词元，可以用不同的挑选策略，在生成的文字里平衡稳妥和创意。</p>',
	'textbook.temperature.title': '温度',
	'textbook.temperature.content':
		'<p><strong>温度</strong>的作用，是在把原始分数变成概率之前先缩一缩它们。<strong>温度低</strong>（比如 0.2）时，大的原始分数会变得更大、小的变得更小，于是更偏向分数最高的词元，结果也更<strong>好猜、更稳妥</strong>。<strong>温度高</strong>（比如 1.0 或更高）时，分数之间的差距被拉平，本来不太可能的词元也有机会，结果就更有<strong>创意</strong>。</p>',
	'textbook.sampling.title': '采样策略',
	'textbook.sampling.content':
		'<p>最后，还要有一个办法来挑出下一个词元。做法有很多，常见的有：贪心搜索直接选分数最高的那一个；<strong>Top-k</strong> 只留下最有可能的 k 个词元；<strong>Top-p</strong> 则留下总概率刚好达到 p 的最小的那批词元，先把不太可能的提前去掉。</p><p>接着用 Softmax 把剩下的原始分数变成概率，再从允许的这批词元里随机挑一个。</p>',
	'textbook.residual.title': '残差连接',
	'textbook.residual.content': `<p>Transformer 还有一些辅助设计，能让模型表现更好。比如<strong>残差连接</strong>会把层的输入加到它的输出上，这样信息经过很多个块也不会越来越淡。在 GPT-2 里，每个块会用到两次，让叠得很深的模型也能训练好。</p>`,
	'textbook.layer-normalization.title': '层归一化',
	'textbook.layer-normalization.content': `<p><strong>层归一化</strong>会调整输入的数字，让它们的平均值和波动范围保持稳定，训练和预测都能更平稳。这样模型对一开始的权重没那么敏感，也更容易学好。在 GPT-2 里，自注意力之前、MLP 之前，以及最后输出之前，都会做一次层归一化。</p>`,
	'textbook.dropout.title': 'Dropout',
	'textbook.dropout.content': `<p>训练的时候，<strong>随机丢弃（Dropout）</strong>会随机把一些数字之间的联系暂时关掉，免得模型死记某些特定规律。这样学到的东西更容易举一反三。GPT-2 用了它，但更新的 LLM 常常不用，因为它们训练的数据量特别大，死记硬背的问题不那么严重。做预测时，随机丢弃会关掉。</p>`
};
