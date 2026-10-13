# Transformer Explainer: Interactive Learning of Text-Generative Models

Transformer Explainer is an interactive visualization tool designed to help anyone learn how Transformer-based models like GPT work. It runs a live GPT-2 model right in your browser, allowing you to experiment with your own text and observe in real time how internal components and operations of the Transformer work together to predict the next tokens. Try Transformer Explainer at http://poloclub.github.io/transformer-explainer and watch a demo video on YouTube https://youtu.be/TFUc41G2ikY.<br/><br/>
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)
[![arxiv badge](https://img.shields.io/badge/arXiv-2408.04619-red)](https://arxiv.org/abs/2408.04619)

<a href="https://youtu.be/TFUc41G2ikY" target="_blank"><img width="100%" src='https://github.com/user-attachments/assets/0a4d8888-6555-4df5-bc71-77f1299115c3'></a>

## Live Demo

Try Transformer Explainer: http://poloclub.github.io/transformer-explainer

## Research Paper

[**Transformer Explainer: Learning LLM Transformers with Interactive Visual Explanation and Experimentations**](https://dl.acm.org/doi/pdf/10.1145/3772318.3791725).
Aeree Cho, Grace C. Kim, Alexander Karpekov, Seongmin Lee, Alec Helbling, Benjamin Hoover, Zijie J. Wang, Minsuk Kahng, Duen Horng Chau.
_Proceedings of the 2026 CHI Conference on Human Factors in Computing Systems._

## 本地运行（无需外网下载 tokenizer）

环境要求：Node.js 20.19+（或 22.12+）、npm 10+。

在项目目录执行：

```bash
npm ci --ignore-scripts
npm run dev
```

打开 http://localhost:5173。首次安装 npm 依赖需要网络；依赖安装完成后，启动、构建和浏览器推理均使用本地资源。`--ignore-scripts` 跳过本项目不需要的 Sharp 原生图像处理安装脚本；浏览器所需的依赖和构建工具已经包含在 npm 包中。

本地资源位置：

| 资源                 | 位置                                          | 加载方式                                                     |
| -------------------- | --------------------------------------------- | ------------------------------------------------------------ |
| GPT-2 tokenizer      | `static/tokenizer/gpt2/`                      | 随项目提供，禁用 Hugging Face 下载和远程回退                 |
| GPT-2 ONNX 模型      | `static/model-v2/gpt2.onnx.part0` 至 `part62` | 保留原有 63 个本地分片                                       |
| ONNX WASM 和加载模块 | `static/onnxruntime/`                         | 启动/构建前从已安装的 `onnxruntime-web` 包复制，确保版本一致 |
| Jersey 10 字体       | `static/fonts/`                               | 本地字体文件，附 OFL 许可                                    |
| KaTeX 样式和字体     | npm 中的 `katex/dist/`                        | Vite 本地打包                                                |

`npm run dev`、`npm run build` 和 `npm test` 会先校验 tokenizer/字体的 SHA-256，以及模型分片是否完整存在，再准备 ONNX 文件；这一步不会联网。资源缺失或损坏会明确报错。模型分片检查验证文件尺寸，浏览器加载时再验证实际 ONNX 数据。

页面不再挂载 Google Analytics/Tag Manager，也不自动嵌入 YouTube。视频、论文和参考资料保留为普通外部链接，仅主动打开时需要网络。

模型约 **626 MiB**，首次打开仍需从本机读取并在浏览器内初始化，这不是外网下载。后续打开会尽量复用浏览器的模型分片缓存。请保留全部本地资源，并通过本地 HTTP 服务访问，不能直接双击 HTML 文件。手机端保留原有示例模式；自定义输入推理请使用桌面浏览器。

## 启动优化与检查

模型加载现在显示分词器准备、分片读取、初始化和失败重试状态。缓存不可用时继续使用本地文件；示例在分词器就绪后可用，自定义生成要等真实模型就绪。

`npm run check` 检查全项目类型，`npm test` 包含加载与生命周期回归用例。使用 `?startupDebug=1` 查看本地分阶段诊断，默认不输出这些记录。性能样本、验证结果和限制见 [启动优化实测](docs/startup-baseline.md)。日常演示可使用上述构建后预览方式，避免首次开发编译等待。

## 界面语言（中英切换）

界面默认显示浅白中文，顶栏右侧的滑块可在中文与英文之间切换，选择会保存在浏览器 `localStorage` 中。全部界面文案集中在 `src/i18n/en.ts` 与 `src/i18n/zh.ts`，两侧键一一对应；长文章（`src/components/article/Article.svelte`）同时保留英文原版与中文翻译两个分支。新增文案时请同时补充两个词典，`npm test` 会检查键一致性、占位符与 `$t()` 使用点是否齐全。

构建并预览静态版本：

```bash
npm run build
npm run preview -- --host 127.0.0.1
```

打开 http://127.0.0.1:4173。生产构建默认使用根路径；如需保留 GitHub Pages 的子路径部署，可使用 `BASE_PATH=/transformer-explainer npm run build`。`build/` 中包含运行所需的全部资源，可复制到离线机器并用静态 HTTP 服务运行。

离线 tokenizer 回归测试：

```bash
npm test
```

测试禁止任何网络请求，检查已知 GPT-2 token ID、中文/表情/空白往返，并确认本地文件缺失时不会尝试远程下载。

## Credits

Transformer Explainer was created by <a href="https://aereeeee.github.io/" target="_blank">Aeree Cho</a>, <a href="https://www.linkedin.com/in/chaeyeonggracekim/" target="_blank">Grace C. Kim</a>, <a href="https://alexkarpekov.com/" target="_blank">Alexander Karpekov</a>, <a href="https://alechelbling.com/" target="_blank">Alec Helbling</a>, <a href="https://zijie.wang/" target="_blank">Jay Wang</a>, <a href="https://seongmin.xyz/" target="_blank">Seongmin Lee</a>, <a href="https://bhoov.com/" target="_blank">Benjamin Hoover</a>, and <a href="https://poloclub.github.io/polochau/" target="_blank">Polo Chau</a> at the Georgia Institute of Technology.

## Citation

```bibTeX
@inproceedings{cho2026transformer,
  title={Transformer Explainer: Learning LLM Transformers with Interactive Visual Explanation and Experimentation},
  author={Cho, Aeree and Kim, Grace C and Karpekov, Alexander and Lee, Seongmin and Helbling, Alec and Hoover, Benjamin and Wang, Zijie J and Kahng, Minsuk and Chau, Duen Horng},
  booktitle={Proceedings of the 2026 CHI Conference on Human Factors in Computing Systems},
  pages={1--21},
  year={2026}
}
```

## License

The software is available under the [MIT License](https://github.com/poloclub/transformer-explainer/blob/main/LICENSE).

## Contact

If you have any questions, feel free to [open an issue](https://github.com/poloclub/transformer-explainer/issues/new/choose) or contact [Aeree Cho](https://aereeeee.github.io/) or any of the contributors listed above.

## More AI explainers to check out

- [**Diffusion Explainer**](https://poloclub.github.io/diffusion-explainer) for learning how Stable Diffusion transforms text prompt into image
- [**CNN Explainer**](https://poloclub.github.io/cnn-explainer)
- [**GAN Lab**](https://poloclub.github.io/ganlab) for playing with Generative Adversarial Networks in browser
