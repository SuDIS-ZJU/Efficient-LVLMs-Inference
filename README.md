# Awesome Efficient Inference for Large Vision-Language Models

<div align="center">

[![Awesome](https://awesome.re/badge.svg)](https://awesome.re)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![Arxiv](https://img.shields.io/badge/arXiv-Survey-b31b1b.svg)](https://arxiv.org/abs/2604.05546)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

<br>

<div align="center">
<b>Jun Zhang*</b><sup>1,2</sup>,
<b>Yicheng Ji*</b><sup>1,2</sup>,
<b>Feiyang Ren*</b><sup>1,2</sup>,
<b>Yihang Li*</b><sup>1,2</sup>,
<b>Bowen Zeng*</b><sup>1,2</sup>,
<b>Zonghao Chen*</b><sup>1,2</sup>,
<b>Ke Chen</b><sup>1,2</sup>,
<b>Lidan Shou</b><sup>1,2</sup>,
<b>Gang Chen</b><sup>1</sup>
<b>Huan Li</b><sup>1,2</sup>
</div>



<div align="center">
<sup>1</sup>The State Key Laboratory of Blockchain and Data Security, Zhejiang University
</div>
<div align="center">
<sup>2</sup>Hangzhou High-Tech Zone (Binjiang) Institute of Blockchain and Data Security
</div>



**A curated list of papers, benchmarks, and resources for efficient inference of Large Vision-Language Models (LVLMs).**
<br>
*This repository accompanies our survey paper: "Efficient Inference for Large Vision-Language Models: Bottlenecks, Techniques, and Prospects"*

</div>

---

## 📖 Introduction

<div align="center">
  <img src="assets/overview.png" alt="LVLM Inference Pipeline and Encoding Stage Techniques" width="100%">
  <br>
  <em>Figure 1: LVLM Inference Pipeline and Encoding Stage Techniques. The figure illustrates the three-stage inference workflow (left) and detailed encoding stage optimization techniques (right), showing how visual information flows from raw input to the language model.</em>
</div>

<br>

Large Vision-Language Models (LVLMs) enable complex reasoning over fine-grained visual inputs and long videos, yet their inference remains a primary bottleneck. This overhead is shaped not only by compute but by memory traffic, cache locality, and sequence length.

This repository provides a **systematic taxonomy** of efficiency techniques along three execution stages:
- **👁️ Encoding**: Distilling visual information in compute-bound encoders
- **⚡ Prefilling**: Mitigating quadratic attention via token compression and structured sparsity
- **⏩ Decoding**: Overcoming the "visual memory wall" via KV cache compression, retrieval, and speculative execution

---

## 🧩 Stage-Wise Taxonomy

<div align="center">
  <img src="assets/taxonomy.png" alt="Taxonomy of Efficient Inference Techniques for LVLMs" width="100%">
  <br>
  <em>Figure 2: Taxonomy of Efficient Inference Techniques for LVLMs. We organize existing methods by the three stages of the inference lifecycle. Within each stage, techniques are further categorized by their specific optimization mechanisms to facilitate a clear understanding of WHERE and HOW computational redundancy is reduced.</em>
</div>

---

## 📑 Table of Contents

- [Encoding Stage](#-encoding-stage)
  - [Efficient Vision Encoders](#efficient-vision-encoders)
  - [Efficient Modality Adapters](#efficient-modality-adapters)
  - [Keyframe Selection](#keyframe-selection)
  - [Adaptive Resolution](#adaptive-resolution)
  - [Encoding-Oriented Token Compression](#encoding-oriented-token-compression)
- [Prefilling Stage](#-prefilling-stage)
  - [Token Compression](#token-compression)
  - [Sparse Attention](#sparse-attention)
- [Decoding Stage](#-decoding-stage)
  - [KV Cache Compression](#kv-cache-compression)
  - [Speculative Decoding](#speculative-decoding)
  - [Efficient Reasoning](#efficient-reasoning)
- [Benchmarks and Datasets](#-benchmarks-and-datasets)
- [Survey and Related Work](#-survey-and-related-work)
- [Citation](#-citation)

---

## 👁️ Encoding Stage

*Optimization techniques targeted at the encoding stage to reduce visual token count and encoding time.*

### Efficient Vision Encoders

#### Image-Related
| Paper | Venue | Code | Key Contribution |
|:---|:---:|:---:|:---|
| [**FastViT: A fast hybrid vision transformer using structural reparameterization**](https://doi.org/10.1109/ICCV51070.2023.00532) | ICCV 2023 | [![GitHub](https://img.shields.io/badge/GitHub-black?logo=github)](https://github.com/apple/ml-fastvit) | Novel token mixing operators and structural reparameterization |
| [**ConvLLaVA: Hierarchical backbones as visual encoder for large multimodal models**](https://arxiv.org/abs/2405.15738) | arXiv 2024 | [![GitHub](https://img.shields.io/badge/GitHub-black?logo=github)](https://github.com/ConvLLaVA/ConvLLaVA) | Compresses high-resolution images into information-rich visual features |
| [**FastVLM: Efficient vision encoding for vision language models**](https://openaccess.thecvf.com/content/CVPR2025/html/Vasu_FastVLM_Efficient_Vision_Encoding_for_Vision_Language_Models_CVPR_2025_paper.html) | CVPR 2025 | [![Page](https://img.shields.io/badge/Project-Page-blue)](https://machinelearning.apple.com/research/fastvlm-efficient-vision-encoding) | Hybrid vision encoder outputting fewer tokens and reducing encoding time |
| [**Glyph: Scaling Context Windows via Visual-Text Compression**](https://arxiv.org/abs/2510.17800) | arXiv 2025 | [![GitHub](https://img.shields.io/badge/GitHub-black?logo=github)](https://github.com/thu-coai/Glyph) | DeepEncoder maintaining low activations under high-resolution input |

#### Video-Related
| Paper | Venue | Code | Key Contribution |
|:---|:---:|:---:|:---|
| [**Qwen2-VL: Enhancing vision-language model's perception of the world at any resolution**](https://arxiv.org/abs/2409.12191) | arXiv 2024 | [![GitHub](https://img.shields.io/badge/GitHub-black?logo=github)](https://github.com/QwenLM/Qwen2-VL) | Native Dynamic Resolution framework enabling adaptive visual token generation |
| [**Video-ChatGPT: Towards detailed video understanding via large vision and language models**](https://doi.org/10.18653/v1/2024.acl-long.679) | ACL 2024 | [![GitHub](https://img.shields.io/badge/GitHub-black?logo=github)](https://github.com/mbzuai-oryx/Video-ChatGPT) | Applies pooling over visual tokens to obtain compact visual representations |
| [**MovieChat: From dense token to sparse memory for long video understanding**](https://doi.org/10.1109/CVPR52733.2024.01725) | CVPR 2024 | [![GitHub](https://img.shields.io/badge/GitHub-black?logo=github)](https://github.com/Gapry/MovieChat) | Vision encoder explicitly trained for long video scenarios |
| [**Long context transfer from language to vision**](https://arxiv.org/abs/2406.16852) | arXiv 2024 | - | Vision encoder explicitly trained for long video scenarios |
| [**LongVLM: Efficient long video understanding via large language models**](https://doi.org/10.1007/978-3-031-73414-4_26) | ECCV 2024 | [![GitHub](https://img.shields.io/badge/GitHub-black?logo=github)](https://github.com/ziplab/LongVLM) | Vision encoder explicitly trained for long video scenarios |
| [**LongVU: Spatiotemporal Adaptive Compression for Long Video-Language Understanding**](https://openreview.net/forum?id=XzZC4gs1mf) | ICML 2025 | [![Page](https://img.shields.io/badge/Project-Page-blue)](https://vision-cair.github.io/LongVU/) | Preserves full features for query-relevant frames while applying spatial pooling |

### Efficient Modality Adapters

| Paper | Venue | Code | Key Contribution |
|:---|:---:|:---:|:---|
| [**BLIP-2: Bootstrapping Language-Image Pre-training**](https://proceedings.mlr.press/v202/li23q.html) | ICML 2023 | [![GitHub](https://img.shields.io/badge/GitHub-black?logo=github)](https://github.com/salesforce/LAVIS) | Bridges modality gap with lightweight Querying Transformer (Q-Former) |
| [**Video-LLaMA: An instruction-tuned audio-visual language model**](https://arxiv.org/abs/2306.02858) | arXiv 2023 | [![GitHub](https://img.shields.io/badge/GitHub-black?logo=github)](https://github.com/DAMO-NLP-SG/Video-LLaMA) | Proposes Video Q-Former for multi-modality video comprehension |
| [**Dynamic-VLM: Simple Dynamic Visual Token Compression for VideoLLM**](https://doi.org/10.48550/ARXIV.2412.09530) | arXiv 2024 | - | Dynamic visual token compression architecture adapting to different lengths |
| [**TokenPacker: Efficient Visual Projector for Multimodal LLM**](https://doi.org/10.1007/S11263-025-02491-7) | IJCV 2025 | - | Coarse-to-fine scheme injecting enriched characteristics |

### Keyframe Selection

#### Training-Free
| Paper | Venue | Code | Key Contribution |
|:---|:---:|:---:|:---|
| [**SeViLA: Self-chained image-language model for video localization**](http://papers.nips.cc/paper_files/paper/2023/hash/f22a9af8dbb348952b08bd58d4734b50-Abstract-Conference.html) | NeurIPS 2023 | [![GitHub](https://img.shields.io/badge/GitHub-black?logo=github)](https://github.com/Yui010206/SeViLA) | Uses frozen models as plug-and-play selectors for frame localization |
| [**KeyVideoLLM: Towards large-scale video keyframe selection**](https://arxiv.org/abs/2407.03104) | arXiv 2024 | - | Employs frozen models as plug-and-play selectors for keyframe localization |
| [**Q-Frame: Query-aware Frame Selection and Multi-Resolution Adaptation**](https://arxiv.org/abs/2506.22139) | arXiv 2025 | - | Text-image matching network with Gumbel-Max trick |
| [**VideoTree: Adaptive tree-based video representation**](https://openaccess.thecvf.com/content/CVPR2025/html/Wang_VideoTree_Adaptive_Tree-based_Video_Representation_for_LLM_Reasoning_on_Long_CVPR_2025_paper.html) | CVPR 2025 | - | Multi-granularity tree-based representation extracting query-relevant details |
| [**FOCUS: Efficient Keyframe Selection for Long Video Understanding**](https://arxiv.org/abs/2510.27280) | arXiv 2025 | - | Formulates keyframe selection as combinatorial pure-exploration |

#### Training-Aware
| Paper | Venue | Code | Key Contribution |
|:---|:---:|:---:|:---|
| [**VILA: Efficient video-language alignment for video question answering**](https://doi.org/10.1007/978-3-031-73033-7_11) | ECCV 2024 | - | Text-guided Frame-Prompter learning to extract question-related frames |
| [**Frame-Voyager: Learning to query frames for video LLMs**](https://arxiv.org/abs/2410.03226) | arXiv 2024 | - | Learns to query informative frame combinations |
| [**M-LLM based video frame selection for efficient video understanding**](https://openaccess.thecvf.com/content/CVPR2025/html/Hu_M-LLM_Based_Video_Frame_Selection_for_Efficient_Video_Understanding_CVPR_2025_paper.html) | CVPR 2025 | - | Uses spatial and temporal signals as supervision to train frame selector |

### Adaptive Resolution

| Paper | Venue | Code | Key Contribution |
|:---|:---:|:---:|:---|
| [**VisionThink: Smart and efficient vision language model via reinforcement learning**](https://doi.org/10.48550/arXiv.2507.13348) | arXiv 2025 | - | Dynamically processes distinct samples with different resolutions |
| [**ViCO: A Training Strategy towards Semantic Aware Dynamic High-Resolution**](https://arxiv.org/abs/2510.12793) | arXiv 2025 | - | Multiple MLP connectors with different compression ratios |
| [**Q-Frame: Query-aware Frame Selection and Multi-Resolution Adaptation**](https://arxiv.org/abs/2506.22139) | arXiv 2025 | - | Text-image matching network with Gumbel-Max trick |
| [**LongVU: Spatiotemporal Adaptive Compression**](https://openreview.net/forum?id=XzZC4gs1mf) | ICML 2025 | [![Page](https://img.shields.io/badge/Project-Page-blue)](https://vision-cair.github.io/LongVU/) | Preserves full features for query-relevant frames |

### Encoding-Oriented Token Compression

#### Attention-Free
| Paper | Venue | Code | Key Contribution |
|:---|:---:|:---:|:---|
| [**LLaVA-PruMerge: Adaptive Token Reduction**](https://arxiv.org/abs/2403.15388) | arXiv 2024 | [![GitHub](https://img.shields.io/badge/GitHub-black?logo=github)](https://github.com/Unicorn-3965/LLaVA-PruMerge) | Reduces visual tokens according to similarities between class and spatial tokens |
| [**PVC: Progressive Visual Token Compression**](https://arxiv.org/abs/2412.09613) | arXiv 2024 | - | Progressive compression strategy extending images as static videos |
| [**Less is More: A Simple yet Effective Token Reduction Method**](https://arxiv.org/abs/2409.10994) | arXiv 2024 | - | Token reduction using both CLIP metric and similarity (TRIM) |
| [**FOLDER: Accelerating Multi-modal Large Language Models**](https://arxiv.org/abs/2501.02430) | arXiv 2025 | - | Plug-and-play module in final vision backbone blocks for merging operations |
| [**Dynamic-VLM: Simple Dynamic Visual Token Compression**](https://doi.org/10.48550/ARXIV.2412.09530) | arXiv 2024 | - | Dynamic visual token compression architecture adapting to different lengths |
| [**Beyond Text-Visual Attention: Exploiting Visual Cues for Effective Token Pruning**](https://arxiv.org/abs/2412.01818) | arXiv 2025 | - | Selects informative tokens using visual attention (VisPruner) |

#### Attention-Aware
| Paper | Venue | Code | Key Contribution |
|:---|:---:|:---:|:---|
| [**VisionZip: Longer is Better but Not Necessary**](https://arxiv.org/abs/2412.04467) | arXiv 2024 | [![GitHub](https://img.shields.io/badge/GitHub-black?logo=github)](https://github.com/VILA-Lab/VisionZip) | Selects informative tokens using visual attention from encoder |
| [**HIVTP: Hierarchical Visual Token Pruning**](https://arxiv.org/abs/2509.23663) | arXiv 2025 | - | Attention maps from middle encoder layers to estimate visual token importance |
| [**ToSA: Token Merging with Spatial Awareness**](https://arxiv.org/abs/2506.20066) | arXiv 2025 | - | Token merging combining semantic and spatial awareness |
| [**SparseVILA: Decoupling Visual Sparsity for Efficient VLM Inference**](https://arxiv.org/abs/2510.17777) | ICCV 2025 | - | Estimates token importance from visual encoder's self-attention maps |

---

## ⚡ Prefilling Stage

*Techniques to reduce computational and memory overhead during the prefilling stage.*

### Token Compression

#### Diversity-Guided
| Paper | Venue | Code | Key Contribution |
|:---|:---:|:---:|:---|
| [**FrameFusion: Combining similarity and importance**](https://arxiv.org/abs/2501.01986) | arXiv 2024 | - | Merges tokens in shallow layers and prunes in deep layers |
| [**G-Prune: Training-free visual token pruning from graph perspective**](https://doi.org/10.1609/aaai.v39i4.32427) | AAAI 2025 | - | Similarity graph and information flow to retain representative tokens |
| [**DART: Stop looking for important tokens, duplication matters more**](https://arxiv.org/abs/2502.11494) | arXiv 2025 | - | Pivot-based duplication pruning selecting tokens with low duplication |
| [**AIM: Adaptive Inference of Multi-Modal LLMs**](https://doi.org/10.48550/ARXIV.2412.03248) | arXiv 2024 | - | Spatiotemporal token merging to reduce video redundancy |
| [**DivPrune: Diversity-based visual token pruning**](https://openaccess.thecvf.com/content/CVPR2025/html/Alvar_DivPrune_Diversity-based_Visual_Token_Pruning_for_Large_Multimodal_Models_CVPR_2025_paper.html) | CVPR 2025 | - | Max-Min diversity optimization for token subset selection |
| [**FastVID: Dynamic density pruning for fast video LLMs**](https://arxiv.org/abs/2503.11187) | arXiv 2025 | [![GitHub](https://img.shields.io/badge/GitHub-black?logo=github)](https://github.com/LunarShen/FastVID) | Temporal segmentation and density spatiotemporal pruning |
| [**DyCoke: Dynamic Compression of Tokens for Fast Video LLMs**](https://openaccess.thecvf.com/content/CVPR2025/html/Tao_DyCoke_Dynamic_Compression_of_Tokens_for_Fast_Video_Large_Language_CVPR_2025_paper.html) | CVPR 2025 | - | Plug-and-play temporal compression module minimizing temporal redundancy |
| [**CDPruner: Maximizing Conditional Diversity for Token Pruning**](https://arxiv.org/abs/2506.10967) | arXiv 2025 | - | Determinantal Point Processes (DPP) maximizing conditional diversity |
| [**PruneVid: Visual token pruning for efficient video LLMs**](https://aclanthology.org/2025.findings-acl.1024/) | ACL 2025 | - | Spatiotemporal token merging before LLMs |
| [**HoliTom: Holistic Token Merging for Fast Video LLMs**](https://arxiv.org/abs/2505.21334) | arXiv 2025 | - | Global redundancy-aware segmentation followed by spatiotemporal merging |
| [**VidCom2: Video Compression Commander**](https://arxiv.org/abs/2505.14454) | arXiv 2025 | - | Dynamic compression based on frame uniqueness |
| [**STTM: Multi-granular spatio-temporal token merging**](https://doi.org/10.48550/arXiv.2507.07990) | ICCV 2025 | - | Quadtree spatial transformation with directed pairwise merging |
| [**StreamingTOM: Streaming Token Compression**](https://arxiv.org/abs/2510.18269) | arXiv 2025 | - | Causal temporal reduction with fixed per-frame budget |
| [**Dynamic-VLM: Simple Dynamic Visual Token Compression**](https://doi.org/10.48550/ARXIV.2412.09530) | arXiv 2024 | - | Dynamic visual token compression architecture adapting to different lengths |
| [**TimeChat-Online: 80% Visual Tokens are Naturally Redundant**](https://doi.org/10.48550/ARXIV.2504.17343) | arXiv 2025 | - | Differential token drop module filtering redundant content in streaming videos |

#### Attention-Guided
| Paper | Venue | Code | Key Contribution |
|:---|:---:|:---:|:---|
| [**FastV: An image is worth 1/2 tokens after layer 2**](https://doi.org/10.1007/978-3-031-73004-7_2) | ECCV 2024 | [![GitHub](https://img.shields.io/badge/GitHub-black?logo=github)](https://github.com/pkunlp-icler/FastV) | Learns attention patterns in early layers to prune visual tokens in deeper layers |
| [**PyramidDrop: Accelerating via pyramid visual redundancy reduction**](https://arxiv.org/abs/2410.17247) | arXiv 2024 | [![GitHub](https://img.shields.io/badge/GitHub-black?logo=github)](https://github.com/Cooperx521/PyramidDrop) | Multi-stage pruning using attention score ranking |
| [**FrameFusion: Combining similarity and importance**](https://arxiv.org/abs/2501.01986) | arXiv 2024 | - | Merges tokens in shallow layers and prunes in deep layers |
| [**SparseVLM: Visual token sparsification for efficient inference**](https://arxiv.org/abs/2410.04417) | arXiv 2024 | - | Sparsifies visual tokens based on question prompt through text-visual attention scores |
| [**BTP: Balanced Token Pruning**](https://arxiv.org/abs/2505.22038) | arXiv 2025 | - | Multi-stage pruning with diversity and attention ranking objectives |
| [**Fit and Prune: Fast and training-free visual token pruning**](https://doi.org/10.1609/aaai.v39i21.34366) | AAAI 2025 | - | Minimizes divergence of attention distributions before and after pruning |
| [**ATP-LLaVA: Adaptive token pruning for LVLMs**](https://openaccess.thecvf.com/content/CVPR2025/html/Ye_ATP-LLaVA_Adaptive_Token_Pruning_for_Large_Vision_Language_Models_CVPR_2025_paper.html) | CVPR 2025 | - | Learnable adaptive token pruning module computing importance score |
| [**Video-XL-2: Towards Very Long-Video Understanding Through Task-Aware KV Sparsification**](https://arxiv.org/abs/2506.19225) | arXiv 2025 | - | Chunk-based attention with historical context for video processing |
| [**StreamingVLM: Real-time understanding for infinite video streams**](https://arxiv.org/abs/2510.09608) | arXiv 2025 | - | Maintains compact token subset by reusing attention sinks and recent token windows |

### Sparse Attention

| Paper | Venue | Code | Key Contribution |
|:---|:---:|:---:|:---|
| [**VideoNSA: Native Sparse Attention Scales Video Understanding**](https://arxiv.org/abs/2510.02295) | arXiv 2025 | - | End-to-end training with sparse attention preserving dense attention for text |
| [**SpargeAttn: Accurate sparse attention accelerating any model inference**](https://arxiv.org/abs/2502.18137) | arXiv 2025 | - | Two-stage online filter to skip unimportant regions in sparse attention |
| [**XAttention: Block sparse attention with antidiagonal scoring**](https://arxiv.org/abs/2503.16428) | arXiv 2025 | - | Block sparse attention with antidiagonal scoring for efficient block estimation |
| [**MMInference: Modality-Aware Permutation Sparse Attention**](https://arxiv.org/abs/2504.16083) | arXiv 2025 | - | Identifies three distinct attention patterns in LVLMs with modality-aware permutation |

---

## ⏩ Decoding Stage

*Optimization techniques for the autoregressive decoding stage.*

### KV Cache Compression

#### Token-Level
| Paper | Venue | Code | Key Contribution |
|:---|:---:|:---:|:---|
| [**LOOK-M: Look-once optimization in KV cache**](https://arxiv.org/abs/2406.18139) | arXiv 2024 | - | Text-prior compression policy prioritizing textual KVs while evicting visual tokens |
| [**Elastic Cache: Efficient inference of vision instruction-following models**](https://doi.org/10.1007/978-3-031-72643-9_4) | ECCV 2024 | - | Cache merging strategy fusing less important KVs guided by distinct metrics |
| [**ReKV: Streaming video QA with in-context video KV-cache retrieval**](https://arxiv.org/abs/2503.00540) | arXiv 2025 | - | Retrieval-based framework offloading video chunks to external memory |
| [**LiveVLM: Efficient Online Video Understanding via Streaming-Oriented KV Cache**](https://arxiv.org/abs/2505.15269) | arXiv 2025 | - | Dual-memory approach with short-term sliding window and compressed long-term memory |
| [**FastCache: Optimizing multimodal LLM serving**](https://arxiv.org/abs/2503.08461) | arXiv 2025 | - | Lightweight modality-specific compressor learning compression patterns |

#### Layer-Level
| Paper | Venue | Code | Key Contribution |
|:---|:---:|:---:|:---|
| [**VL-Cache: Sparsity and modality-aware KV cache compression**](https://arxiv.org/abs/2410.23317) | arXiv 2024 | - | Dynamically sets each layer's cache size according to measured attention sparsity |
| [**Meda: Dynamic KV cache allocation for efficient multimodal inference**](https://arxiv.org/abs/2502.17599) | arXiv 2025 | - | Cross-modal attention entropy guiding cache allocation to layers with complex interactions |
| [**ST3: Accelerating MLLM by spatial-temporal visual token trimming**](https://doi.org/10.1609/aaai.v39i10.33201) | AAAI 2025 | - | Progressive pruning of visual tokens in deeper layers based on decreasing visual importance |
| [**MadaKV: Adaptive Modality-Perception KV Cache Eviction**](https://aclanthology.org/2025.acl-long.652/) | ACL 2025 | - | Inter-layer compensation mechanism dynamically adjusting budgets |
| [**InfiniPot-V: Memory-Constrained KV Cache Compression**](https://arxiv.org/abs/2506.15745) | arXiv 2025 | - | Layer-wise adaptive pooling with varying kernel sizes to balance abstraction and detail |

#### Head-Level
| Paper | Venue | Code | Key Contribution |
|:---|:---:|:---:|:---|
| [**SparseMM: Head Sparsity Emerges from Visual Concept Responses**](https://arxiv.org/abs/2506.05344) | arXiv 2025 | - | Identifies vital visual heads and allocates asymmetric budgets based on visual relevance |

#### Bit-Level
| Paper | Venue | Code | Key Contribution |
|:---|:---:|:---:|:---|
| [**AKVQ-VL: Attention-Aware KV Cache Adaptive 2-Bit Quantization**](https://arxiv.org/abs/2501.15021) | arXiv 2025 | - | Adaptive mixed-precision quantization with high bit-width for critical tokens and 2-bit for others |
| [**CalibQuant: 1-Bit KV Cache Quantization for Multimodal LLMs**](https://arxiv.org/abs/2502.14882) | arXiv 2025 | - | Channel-wise 1-bit quantization with post-calibration for extreme values |
| [**VidKV: Plug-and-Play 1.x-Bit KV Cache Quantization**](https://arxiv.org/abs/2503.16257) | arXiv 2025 | - | Sub-2-bit quantization with differential treatment for K and V |

### Speculative Decoding

#### Training-Free
| Paper | Venue | Code | Key Contribution |
|:---|:---:|:---:|:---|
| [**SpecVLM: Enhancing speculative decoding via verifier-guided token pruning**](https://doi.org/10.48550/arXiv.2508.16201) | EMNLP 2025 | - | Verifier-guided staged pruning removing up to 90% of vision tokens from draft model input |

#### Training-Aware
| Paper | Venue | Code | Key Contribution |
|:---|:---:|:---:|:---|
| [**Spec-LLaVA: Accelerating VLMs with Dynamic Tree-Based Speculative Decoding**](https://arxiv.org/abs/2509.11961) | arXiv 2025 | - | Compact distilled draft model paired with tree-based verification algorithm |
| [**MSD: Speculative Decoding Reimagined for Multimodal Large Language Models**](https://arxiv.org/abs/2505.14260) | arXiv 2025 | - | Two-stage training enabling draft model to acquire language modeling and visual perception |
| [**ViSpec: Accelerating VLMs with Vision-Aware Speculative Decoding**](https://arxiv.org/abs/2509.15235) | arXiv 2025 | - | Lightweight vision adaptor to compress image tokens for draft model |
| [**FastVLM: Self-Speculative Decoding for Fast Vision-Language Model Inference**](https://arxiv.org/abs/2510.22641) | arXiv 2025 | - | Imitation-based draft model learning from deeper representations (self-speculative decoding) |
| [**Glyph: Scaling Context Windows via Visual-Text Compression**](https://arxiv.org/abs/2510.17800) | arXiv 2025 | [![GitHub](https://img.shields.io/badge/GitHub-black?logo=github)](https://github.com/thu-coai/Glyph) | Introduces DeepEncoder maintaining low activations under high-resolution input |
| [**SpecVLM: Fast Speculative Decoding in Vision-Language Models**](https://arxiv.org/abs/2509.11815) | arXiv 2025 | - | Elastic visual compressor adaptively selecting from multiple compression primitives |
| [**FLASH: Latent-Aware Semi-Autoregressive Speculative Decoding**](https://arxiv.org/abs/2505.12728) | arXiv 2025 | - | Visual token compression mechanism and semi-autoregressive head for draft model optimization |

### Efficient Reasoning

| Paper | Venue | Code | Key Contribution |
|:---|:---:|:---:|:---|
| [**Adaptive Fast-and-Slow Visual Program Reasoning for Long-Form VideoQA**](https://arxiv.org/abs/2509.17743) | arXiv 2025 | - | Fast-slow reasoning framework routing simple queries to VideoLLM and complex ones to visual program workflow |
| [**PixelThink: Towards Efficient Chain-of-Pixel Reasoning**](https://arxiv.org/abs/2505.23727) | arXiv 2025 | - | Reinforcement learning to regulate reasoning chain length based on task difficulty and model confidence |
| [**Prolonged reasoning is not all you need: Certainty-based adaptive routing**](https://arxiv.org/abs/2505.15154) | arXiv 2025 | - | Certainty-based routing triggering long thought chains only when initial answer exhibits high uncertainty |

---

## 📊 Benchmarks and Datasets

### Multimodal Understanding Benchmarks

| Benchmark | Description | Resources |
|:---|:---|:---:|
| **MME** | Comprehensive evaluation for multimodal LLMs | [[Paper]](https://arxiv.org/abs/2306.13394) [[Leaderboard]](https://github.com/BradyFU/Awesome-Multimodal-Large-Language-Models/tree/Evaluation) |
| **SEED-Bench** | Benchmarking multimodal LLMs | [[Paper]](https://arxiv.org/abs/2307.16125) [[Code]](https://github.com/AILab-CVC/SEED-Bench) |
| **MMMU** | Massive multi-discipline multimodal understanding | [[Paper]](https://arxiv.org/abs/2311.16502) [[Website]](https://mmmu-benchmark.github.io/) |

### Video Understanding Benchmarks

| Benchmark | Description | Resources |
|:---|:---|:---:|
| **Video-MME** | First comprehensive video analysis benchmark | [[Paper]](https://arxiv.org/abs/2405.21075) [[Website]](https://video-mme.github.io/) |
| **LongVideoBench** | Long-context interleaved video-language understanding | [[Paper]](https://arxiv.org/abs/2407.15754) [[Code]](https://github.com/longvideobench/LongVideoBench) |
| **MVBench** | Comprehensive multi-modal video understanding | [[Paper]](https://arxiv.org/abs/2311.17005) [[Code]](https://github.com/OpenGVLab/Ask-Anything) |

---

## 📚 Survey and Related Work

### Related Surveys

| Survey | Description | Year |
|:---|:---|:---:|
| **Token Compression Survey** | Survey on token compression in LLMs | 2025 | [[Paper]](https://arxiv.org/abs/2501.05787) |
| **Efficient LLMs Survey** | Comprehensive survey on efficient LLMs | 2024 | [[Paper]](https://arxiv.org/abs/2312.03863) |
| **MLLM Survey** | Survey on multimodal LLMs | 2024 | [[Paper]](https://arxiv.org/abs/2306.13549) |

---

## 📝 Citation

If you find this repository useful, please consider citing our survey paper:

```bibtex
@misc{zhang2026efficientinferencelargevisionlanguage,
      title={Efficient Inference for Large Vision-Language Models: Bottlenecks, Techniques, and Prospects}, 
      author={Jun Zhang and Yicheng Ji and Feiyang Ren and Yihang Li and Bowen Zeng and Zonghao Chen and Ke Chen and Lidan Shou and Gang Chen and Huan Li},
      year={2026},
      eprint={2604.05546},
      archivePrefix={arXiv},
      primaryClass={cs.CL},
      url={https://arxiv.org/abs/2604.05546}, 
}

```

---

## 🤝 Contributing

We welcome contributions! If you find a relevant paper or resource that should be included, please:

1. Fork this repository
2. Add the paper to the appropriate category
3. Submit a pull request

For detailed guidelines, see [CONTRIBUTING.md](https://www.google.com/search?q=CONTRIBUTING.md).

---

**Disclaimer**: This is a living document and will be continuously updated. If you notice any missing papers or have suggestions for better categorization, feel free to open an issue or submit a pull request.

*Last Updated: 2026-04-08*

```
