/**
 * English dictionary. Every user-visible string of the interface lives here so
 * `src/i18n/zh.ts` can mirror it key by key.
 */
export const en = {
	// Browser tab / share metadata
	'meta.title': 'Transformer Explainer: LLM Transformer Model Visually Explained',
	'meta.description':
		'An interactive visualization tool showing you how transformer models work in large language models (LLM) like GPT.',

	// Language switch
	'lang.switch': 'Switch language',
	'lang.zh': '中文',
	'lang.en': 'EN',

	// Input area
	'input.examples': 'Examples',
	'input.placeholder': 'Test your own input text',
	'input.helper.mobile':
		'Try the examples. Please use a desktop computer to input GPT-2 prompts directly.',
	'input.helper.loading': 'Try the examples while the local GPT-2 model is loading (626MB)',
	'input.helper.wordLimit': 'You can enter up to {n} words.',
	'input.generate': 'Generate',

	// Startup progress and accessible control names
	'input.helper.tokenizer': 'Preparing the local tokenizer…',
	'input.helper.reading': 'Reading the local model: {completed}/{total}. You can try the examples.',
	'input.helper.initializing': 'Initializing the local model. You can try the examples.',
	'input.helper.failed': 'Local resources could not load. Retry loading.',
	'input.helper.inferenceError': 'Generation failed. You can try again.',
	'error.retry': 'Retry loading',
	'error.inferenceTitle': 'Unable to run the local model.',
	'error.inferenceHint': 'Try a shorter input and generate again.',
	'topbar.paper': 'Read the research paper',
	'topbar.video': 'Watch the video tutorial',
	'topbar.repository': 'Open the source repository',
	'popover.finishAnimation': 'Finish the animation',
	'popover.restartAnimation': 'Restart the animation',
	'popover.close': 'Close',
	'popover.help': 'Help',
	'textbook.previousPage': 'Previous page',
	'textbook.nextPage': 'Next page',
	'textbook.progress': 'Choose a textbook page',
	'textbook.pageCounter': 'Page {current} of {total}',
	'textbook.openButton': 'Open the textbook',

	// Sliders
	'param.temperature': 'Temperature',
	'param.sampling': 'Sampling',

	// Visualization labels
	'viz.previousBlock': 'Previous Transformer block',
	'viz.nextBlock': 'Next Transformer block',
	'viz.previousHead': 'Previous attention head',
	'viz.nextHead': 'Next attention head',
	'viz.embedding': 'Embedding',
	'viz.tokenization': 'Tokenization',
	'viz.tokenEmbedding': 'Token Embedding',
	'viz.positionalEncoding': 'Positional Encoding',
	'viz.vectorSize': 'vector({n})',
	'viz.id': 'id',
	'viz.position': 'position',
	'viz.query': 'Query',
	'viz.key': 'Key',
	'viz.value': 'Value',
	'viz.multiHeadSelfAttention': 'Multi-head Self Attention',
	'viz.out': 'Out',
	'viz.headOf': 'Head {current} of {total}',
	'viz.queryVector': 'Query, Head {head}, vector({n})',
	'viz.keyVector': 'Key, Head {head}, vector({n})',
	'viz.valueVector': 'Value, Head {head}, vector({n})',
	'viz.mlp': 'MLP',
	'viz.dotProduct': 'Dot product',
	'viz.scalingMask': 'Scaling · Mask',
	'viz.softmax': 'Softmax',
	'viz.attention': 'Attention',
	'viz.probabilities': 'Probabilities',
	'viz.tokens': 'Tokens',
	'viz.logits': 'Logits',
	'viz.scaledLogits': 'Scaled logits',
	'viz.normalization': 'Normalization',
	'viz.softmaxAndTopP': 'Softmax & Top-p',
	'viz.tokenId': 'Token ID: {id}',
	'viz.cumulativeSum': 'sum={value}',
	'viz.gelu': 'GeLU',
	'viz.dropout': 'Dropout',
	'viz.layerNorm': 'Layer Normalization',
	'viz.residual': 'Residual',

	// Hover tooltips on the flow diagram
	'sankey.tooltipQkv': 'click to see QKV calculation',
	'sankey.tooltipAttentionOut': 'click to see Attention Out calculation',
	'sankey.tooltipMlp': 'click to see MLP process',
	'sankey.tooltipLogits': 'click to see Logits calculation',

	// Shared popover chrome
	'popover.readMore': 'Read more',
	'popover.openTextbook': 'Open Textbook',

	// Operation popovers
	'popover.gelu.title': 'GELU Activation',
	'popover.gelu.body':
		'Applies non-linear transformation to linearly transformed output to learn complex patterns.',
	'popover.dropout.title': 'Dropout',
	'popover.dropout.body': 'Disables randomly selected neurons. Used only during training.',
	'popover.layerNorm.title': 'Layer Normalization',
	'popover.layerNorm.body': 'Normalizes layer input to have a standard distribution for stability.',
	'popover.residual.title': 'Residual Connection',
	'popover.residual.body': 'Adds layer input to output to help preserve information.',

	// Weight matrix popovers
	'popover.qkv.title': 'Query Key Value',
	'popover.qkv.weights': 'Q·K·V Weights',
	'popover.qkv.bias': 'Q·K·V Bias',
	'popover.qkv.result': 'Q·K·V',
	'popover.qkv.embeddingsHelp':
		'Embeddings originate from tokens \nbut evolve through blocks, becoming \nabstract representations.',
	'popover.qkv.weightsHelp':
		'Transforms embedding vectors into Query, Key, and Value vectors. \nParameters were learned in training, fixed in prediction.',
	'popover.qkv.biasHelp':
		'Offsets added after transformation. \nParameters that learned in training, fixed in prediction.',
	'popover.attention.title': 'Attention Head {head} Out',
	'popover.attention.attention': 'Attention',
	'popover.value': 'Value',
	'popover.out': 'Out',
	'popover.embeddings': 'Embeddings',
	'popover.mlpUp.title': 'MLP Expansion',
	'popover.expansionWeights': 'Expansion Weights',
	'popover.expansionBias': 'Expansion Bias',
	'popover.expandedEmbeddings': 'Expanded <br />Embeddings',
	'popover.expandedEmbeddingsPlain': 'Expanded Embeddings',
	'popover.mlpUp.embeddingsHelp': 'Embeddings transformed through attention mechanism.',
	'popover.mlpUp.weightsHelp':
		'Projects embedding vectors to expanded latent space. \nParameters were learned in training, fixed in prediction.',
	'popover.mlpUp.biasHelp':
		'Offsets added after expansion. \nParameters that learned in training, fixed in prediction.',
	'popover.mlpDown.title': 'MLP Compression',
	'popover.compressionWeights': 'Compression Weights',
	'popover.compressionBias': 'Compression Bias',
	'popover.compressedEmbeddings': 'Compressed <br />Embeddings',
	'popover.mlpDown.embeddingsHelp': 'Expanded latent vectors through MLP expansion layer.',
	'popover.mlpDown.weightsHelp':
		'Projects expanded latent vectors back to original space. \nParameters that learned in training, fixed in prediction.',
	'popover.mlpDown.biasHelp':
		'Offsets added after compression. \nParameters that learned in training, fixed in prediction.',
	'popover.logits.title': 'Logits',
	'popover.outputEmbedding': 'Output <br />Embedding',
	'popover.projectionWeights': 'Output Projection Weights',
	'popover.projectionBias': 'Output Projection Bias',
	'popover.logits.embeddingsHelp':
		"After passing through all blocks, \nthe final token's embedding vector \ncontains all the contextual information \nfrom the preceding tokens.",
	'popover.logits.weightsHelp':
		'Transforms the final embedding into a vocabulary distribution.\nParameters were learned in training, fixed in prediction.',
	'popover.logits.biasHelp':
		'Offsets added after the transformation.\nParameters were learned in training, fixed in prediction.',
	'popover.logits.logitsHelp':
		'Raw scores representing the model’s preference \nfor each vocabulary token before applying softmax.',

	// Softmax popover
	'popover.softmax.title': 'Probability of "{token}" token being sampled',
	'popover.softmax.scaledLogit': 'Scaled logit',
	'popover.softmax.logit': 'logit',
	'popover.softmax.temperature': 'temperature',
	'popover.softmax.softmax': 'Softmax',
	'popover.softmax.topKFiltering': 'Top-k Filtering',
	'popover.softmax.topPFiltering': 'Top-p Filtering',
	'popover.softmax.ifInTopK': 'If logit ∈ Top-{k}',
	'popover.softmax.otherwise': 'Otherwise',
	'popover.softmax.ifCumulative': 'If cumulative prob ≤ {p}',
	'popover.softmax.normalization': 'Normalization',

	// Positional encoding popover
	'popover.positional.token': 'Token',
	'popover.positional.position': 'Position',
	'popover.positional.embedding': 'Embedding',
	'popover.positional.encodingMatrix': 'Encoding Matrix',

	// Startup errors
	'error.title': 'Unable to load local GPT-2 resources.',
	'error.hint': 'Check that the local assets are present, then reload this page.',

	// Consent alert
	'alert.collect': 'We collect anonymous data for research.',
	'alert.learnMore': 'Learn more',

	// Textbook card / navigation
	'textbook.aria': 'Textbook',

	// Textbook pages
	'textbook.what-is-transformer.title': 'What is Transformer?',
	'textbook.what-is-transformer.content': `<p><strong>Transformer</strong> is the core architecture behind modern AI, powering models like ChatGPT and Gemini. Introduced in 2017, it revolutionized how AI processes information. The same architecture is used for training on massive datasets and for inference to generate outputs. Here we use GPT-2 (small), simpler than newer ones but perfect for learning the fundamentals.</p>`,
	'textbook.how-transformers-work.title': 'How Transformers Work?',
	'textbook.how-transformers-work.content': `<p>Transformers aren't magic—they build text step by step by asking:</p>
	<blockquote class="question">
		"What is the most probable next word that will follow this input?"
	</blockquote>
	<p>Here we explore how a trained model generates text. Write your own text or use an example, then click <strong>Generate</strong> to see it in action. If the model isn’t ready yet, try another <strong>Example</strong>.</p>`,
	'textbook.transformer-architecture.title': 'Transformer Architecture',
	'textbook.transformer-architecture.content':
		'<p>Transformer has three main parts:</p><div class="numbered-list"><div class="numbered-item"><span class="number-circle">1</span><div class="item-content"><strong>Embeddings</strong> turn text into numbers.</div></div><div class="numbered-item"><span class="number-circle">2</span><div class="item-content"><strong>Transformer blocks</strong> mix information with Self-Attention and refine it with an MLP.</div></div><div class="numbered-item"><span class="number-circle">3</span><div class="item-content"><strong>Probabilities</strong> determine the likelihood of each next token.</div></div></div>',
	'textbook.embedding.title': 'Embedding',
	'textbook.embedding.content': `<p>Before a Transformer can use text, it first breaks it into small units and represents each as a list of numbers (vector). This process is called <strong>embedding</strong>, and the term can refer to both the process and the resulting vector.</p><p>In this tool, each vector appears as a rectangle, and hovering over it shows its size.</p>`,
	'textbook.token-embedding.title': 'Token Embedding',
	'textbook.token-embedding.content': `<p><strong>Tokenization</strong> splits input text into tokens—small units like words or parts of words. GPT-2 (small) has 50,257 token vocabulary, each with a unique ID.</p><p>In the <strong>token embedding</strong> step, every token is matched to a 768-number vector from a large lookup table. These vectors are learned during training to best represent each token’s meaning.</p>`,
	'textbook.positional-encoding.title': 'Positional Encoding',
	'textbook.positional-encoding.content': `<p>Word order matters in language. <strong>Positional encoding</strong> gives each token information about its place in the sequence.</p><p>GPT-2 does this by adding a learned positional embedding to the token's embedding, but newer models may use other methods, like RoPE, which encodes position by rotating certain vectors. All aim to help the model understand order in text.</p>`,
	'textbook.blocks.title': 'Repetitive Transformer Blocks',
	'textbook.blocks.content': `<p>A <strong>Transformer block</strong> is the main unit of processing in the model. It has two parts:</p><ul><li><strong>Multi-head self-attention</strong> – lets tokens share information</li><li><strong>MLP</strong> – refines each token's details</li></ul><p>Models stack many blocks so token representations become richer as they pass through. GPT-2 (small) has 12 of them.</p>`,
	'textbook.self-attention.title': 'Multi-Head Self Attention',
	'textbook.self-attention.content':
		'<p><strong>Self-attention</strong> lets the model decide which parts of the input are most relevant to each token. This helps it capture meaning and relationships, even between far-apart words.</p><p>In <strong>multi-head</strong> form, the model runs several attention processes in parallel, each focusing on different patterns in the text.</p>',
	'textbook.qkv.title': 'Query, Key, Value',
	'textbook.qkv.content': `
	<p>To perform self-attention, each token's embedding is transformed into
  <span class="highlight">three new embeddings</span>—
  <span class="blue">Query</span>,
  <span class="red">Key</span>, and
  <span class="green">Value</span>.
  This transformation is done by applying different weights and biases to each token embedding. These parameters (weights and biases), are optimized through training.</p>

<p>Once created, <span class="blue">Queries</span> compare with <span class="red">Keys</span> to measure relevance, and this relevance is used to weight the <span class="green">Values</span>.</p>
`,
	'textbook.multi-head.title': 'Multi-head',
	'textbook.multi-head.content':
		'<p>After creating <span class="blue">Q</span>, <span class="red">K</span>, and <span class="green">V</span> embeddings, the model splits them into several <strong>heads</strong> (12 in GPT-2 small). Each head works with its own smaller set of <span class="blue">Q</span>/<span class="red">K</span>/<span class="green">V</span>, focusing on different patterns in the text—like grammar, meaning, or long-range links.</p><p>Multiple heads let the model learn many kinds of relationships in parallel, making its understanding richer.</p>',
	'textbook.masked-self-attention.title': 'Masked Self Attention',
	'textbook.masked-self-attention.content': `<p>In each head, the model decides how much each token focuses on others:</p><ul><li><strong>Dot Product</strong> – Multiply matching numbers in <span class="blue">Query</span>/<span class="red">Key</span> vectors, sum to get <span class="purple">attention scores</span>.</li><li><strong>Mask</strong> – Hide future tokens so it can't peek ahead.</li><li><strong>Softmax</strong> – Convert scores to probabilities, each row summing to 1, showing focus on earlier tokens.</li></ul>`,
	'textbook.output-concatenation.title': 'Attention Output & Concatenation',
	'textbook.output-concatenation.content':
		'<p>Each head <span class="highlight">multiplies its <span class="purple">attention scores</span> with the <span class="green">Value</span> embeddings to produce its attention output</span>—a refined representation of each token after considering context.</p><p>GPT-2 (small) has 12 such outputs, which are concatenated to form a single vector of the original size (768 numbers).</p>',
	'textbook.mlp.title': 'MLP (Multi-Layer Perceptron)',
	'textbook.mlp.content':
		'<p>The attention output goes through an <strong>MLP</strong> to refine token representations. A Linear layer changes embedding values and size using learned weights and bias, then a non-linear activation decides how much each value passes.</p><p>Many activation types exist; GPT-2 uses <strong>GELU</strong>, which lets small values pass partially and large values pass fully, helping capture both subtle and strong patterns.</p>',
	'textbook.output-logit.title': 'Output Logit',
	'textbook.output-logit.content': `<p>After all Transformer blocks, the last token's output embedding, enriched with context from all previous tokens, is multiplied by learned weights in a final layer.</p><p>This produces <strong>logits</strong>, 50,257 numbers—one for each token in GPT-2’s vocabulary—that indicate how likely each token is to come next.</p>`,
	'textbook.output-probabilities.title': 'Probabilities',
	'textbook.output-probabilities.content':
		'<p>Logits are just raw scores. To make them easier to interpret, we convert them into <strong>probabilities</strong> between 0 and 1, where all add up to 1. This tells us the likelihood of each token being the next word.</p><p>Instead of always picking the highest-probability token, we can use different selection strategies to balance safety and creativity in the generated text.</p>',
	'textbook.temperature.title': 'Temperature',
	'textbook.temperature.content':
		'<p><strong>Temperature</strong> works by scaling the logits before turning them into probabilities. A <strong>low temperature</strong> (e.g., 0.2) makes large logits even larger and small ones smaller, favoring the highest-scoring tokens and leading to more <strong>predictable choices</strong>. A <strong>high temperature</strong> (e.g., 1.0 or above) flattens the differences, making less likely tokens more competitive and leading to more <strong>creative outputs</strong>.</p>',
	'textbook.sampling.title': 'Sampling Strategy',
	'textbook.sampling.content':
		'<p>Finally, we need a strategy to pick the next token. Many exist, but here are common ones: Greedy search picks the top one. <strong>Top-k</strong> keeps only the k most likely tokens, and <strong>top-p</strong> keeps the smallest set whose total probability is at least p—trimming unlikely ones early.</p><p>Then softmax turns the remaining logits into probabilities, and one token is picked at random from the allowed set.</p>',
	'textbook.residual.title': 'Residual Connection',
	'textbook.residual.content': `<p>Transformers have auxiliary features that enhance the model performance. For example, a <strong>residual connection</strong> adds a layer's input to its output, keeping information from fading through many blocks. In GPT-2, it's used twice per block to train deeper stacks effectively.</p>`,
	'textbook.layer-normalization.title': 'Layer Normalization',
	'textbook.layer-normalization.content': `<p><strong>Layer Normalization</strong> helps stabilize both training and inference by adjusting input numbers so their mean and variance stay consistent. This makes the model less sensitive to its starting weights and helps it learn more effectively. In GPT-2, it's applied before self-attention, before the MLP, and once more before the final output.</p>`,
	'textbook.dropout.title': 'Dropout',
	'textbook.dropout.content': `<p>During training, <strong>dropout</strong> randomly turns off some connections between numbers so the model doesn't overfit to specific patterns. This helps it learn features that generalize better. GPT-2 uses it, but newer LLMs often skip it because they train on huge datasets and overfitting is less of a problem. In inference, dropout is turned off.</p>`
};

export type MessageKey = keyof typeof en;
