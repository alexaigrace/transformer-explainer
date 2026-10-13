# GPT-2 tokenizer

Bundled unchanged from `Xenova/gpt2`, revision `bf2c7f02e0b826c60d03af341171bde20893da66`:

- https://huggingface.co/Xenova/gpt2/resolve/bf2c7f02e0b826c60d03af341171bde20893da66/tokenizer.json
- https://huggingface.co/Xenova/gpt2/resolve/bf2c7f02e0b826c60d03af341171bde20893da66/tokenizer_config.json

These contain the GPT-2 byte-level BPE vocabulary, merges, and tokenizer configuration. They are sufficient for Transformers.js 2.17.2 tokenization; the ONNX model already exists separately in `static/model-v2/`. Startup reads these files locally and never refreshes them from Hugging Face.

GPT-2 was released by OpenAI under the MIT license: https://github.com/openai/gpt-2/blob/master/LICENSE. The tokenizer SHA-256 values are checked by `scripts/prepare-local-assets.mjs` before dev/build/test.
