# World Model Research Interview Talk Script

Estimated duration: about 25 minutes at a moderate-to-slow speaking pace.

Style note: this is written as a spoken script. You can read it directly, but it is intentionally slightly conversational so it does not sound like reading a paper abstract.

---

## Timing Plan

| Slide | Section | Target time |
| --- | --- | ---: |
| 01 | Opening | 0:45 |
| 02 | Research identity | 1:30 |
| 03 | Talk outline | 0:50 |
| 04 | Research timeline | 1:20 |
| 05 | Digital human | 1:40 |
| 06 | Foundation models | 1:30 |
| 07 | Foundation priors for applications | 1:25 |
| 08 | World model transition | 1:25 |
| 09 | WorldCam motivation | 1:40 |
| 10 | WorldCam architecture | 1:50 |
| 11 | Action control demo | 1:00 |
| 12 | 3D consistency demo | 1:00 |
| 13 | Future directions | 1:35 |
| 14 | World state | 1:40 |
| 15 | Active work on world state | 1:50 |
| 16 | World state summary | 1:30 |
| 17 | Real-time future focus | 1:45 |
| 18 | Vision | 1:20 |
| 19 | Q&A | 0:25 |

Total: about 25 minutes.

---

## 01. Yang Zhou

大家好，我是 Yang Zhou，目前在 Adobe Research 做 Senior Research Scientist。

今天这个 talk 我想介绍一下我的 research trajectory，以及我现在为什么越来越关注 video world model 这个方向。

如果用一句话总结我的研究兴趣，我一直在做的是 controllable models for dynamic visual worlds。早期这个 dynamic visual world 是 face、body、character，是 digital human 的问题。后来它变成 video generation、video editing、VFX 和 3D generation。最近几年，我觉得这个问题自然走向了 interactive world model，也就是一个模型不仅生成视频，还能被用户控制，能记住世界状态，并且能够在长时间交互中保持一致。

所以这不是一个突然的方向转变，而是一个比较连续的 trajectory：从控制一个人的表情和动作，到控制一段视频，再到控制一个可以被探索、被 revisit、被多个人共享的视觉世界。

[click]

---

## 02. Research Identity

这一页我想先讲一下我自己的 research identity。

我的研究长期关注 foundation models for video generation, visual effects, and digital avatar applications。更具体一点，我关心的是模型如何 generate、edit、and reason over dynamic visual content。这里的 dynamic 很重要，因为视频、人物、场景、交互，本质上都不是单帧图像问题，它们都有时间、动作、状态和一致性。

在 Adobe Research，我参与和领导过几条线的工作。第一条是 video generation foundation model。我 co-founded 了 Adobe 内部比较早的视频生成 research prototype，这个 prototype 后来 transfer 到 Adobe Firefly Video 的研发里面。第二条是 digital avatar 相关的视频模型，比如 talking avatar、lip-sync、pose transfer。第三条是 VFX 和 video enhancement，比如 spatial-temporal super-resolution 和 generative blending。除此之外，我也 mentor 过很多 intern，在 CVPR、ICCV、ECCV、SIGGRAPH、NeurIPS 等会议上产出了一系列工作。

在 UMass PhD 阶段，我做的是更偏 graphics 和 digital human 的方向，包括 audio-driven character speech animation、character rigging and skinning、以及 3D scene generation。这些经历其实塑造了我现在看生成模型的方式：我不只是关心生成质量，也很关心 control、structure、representation、以及最后怎么落到 creative workflow 里面。

最近我的 focus 更集中在 world model 上，包括 long-form video generation、efficient video synthesis、world-state and memory consistency，以及 multi-agent 和 multi-player world modeling。也就是说，我现在更关心的是：一个视频模型能不能从 media generator 变成 interactive world system。

[click]

---

## 03. Talk Map

今天的 talk 我会分成四个部分。

第一部分是 digital human。这是我早期研究的起点，里面包括 speech animation、pose、expression、rigging、stylized character animation 等等。这里的核心关键词是 fine-grained control。

第二部分是 video foundation model and applications。我会讲我从 specialist model 转向 foundation model 的过程，以及我如何用 foundation model prior 反哺一些 downstream creative tasks，比如 digital human、video enhancement、generative blending 和 customization。

第三部分是 video world model。这里会讲我为什么觉得 long video generation、control、memory、real-time streaming 会自然汇合到 world model 这个问题上。

第四部分是 future directions。这里我会更具体地讲我认为接下来最重要的几个问题：drifting、action control、world state、以及 real-time distillation。其中我现在最 active 的 bet 是 world state 和 real-time。

[click]

---

## 04. Research Era Timeline

这一页是我自己的 research era timeline。

我的早期工作主要是 specialist models。那个时候，我们通常针对一个非常具体的问题设计模型，比如 audio-to-face animation、pose transfer、rigging、visibility reasoning。这样的模型通常比较小，但它们要求我们非常深入地理解 domain knowledge。比如 face animation 里面，audio、phoneme、viseme、expression、identity、style 都会影响结果；character animation 里面，skeleton、skin、shape、motion 都是结构化因素。

然后我逐渐进入 foundation model 的时代。这里的变化是，模型本身开始拥有非常强的 generative prior。我们不再只是为每个任务从零设计一个 specialist model，而是开始研究如何训练、使用、adapt large generative models，并把它们带回到下游应用里。

当 video foundation model 和这些 downstream application 的范式逐渐成熟之后，我觉得最后缺的一块拼图就是 world model。因为 world model 把现在 generation 领域最难的几个问题放在了一起：第一，实时生成；第二，物理和因果；第三，long context；第四，3D memory 或者 world state。

所以这条线可以总结成：从 specialist control，到 foundation prior，再到 applied generation，最后走向 interactive world model。

[click]

---

## 05. Digital Human

第一阶段是 Digital Human。

这部分工作覆盖了 face、body、hands、stylized characters 等不同对象上的 control and analysis。这里我想强调的是，当时我们做的不是一个泛化的大模型，而是很多非常具体、非常精细的控制问题。

比如 VisemeNet 是 audio-driven speech animation，希望从语音生成 animator-friendly 的 speech motion。MakeItTalk 是 speaker-aware talking-head animation，也就是从 audio 驱动 2D face 或 talking head。Video Motion Graphs 做 audio-driven gesture reenactment。RigNet 和 MoRig 则是 character rigging 和 motion-aware structure。Skeleton-free Pose Transfer 解决 stylized 3D characters 之间没有 shared skeleton 时如何做 pose transfer。Learning Visibility 则是 human body estimation 里面 visibility reasoning 的问题。

这些工作有一个共同点：它们都要求模型理解非常具体的 structure。你不能只说“生成一个好看的结果”，你必须知道 mouth shape、pose、joint、visibility、skeleton、skin weight、gesture timing 等等是怎么工作的。

这段经历对我后面做 foundation model 也很重要。因为它让我一直相信，generation model 最后一定要回到 controllability 和 structure 上。大模型可以提供 prior，但真正有用的系统必须能被人精确控制，能被放进 production workflow。

[click]

---

## 06. Foundation Models

第二阶段是 Foundation Models。

在 specialist model 之后，我开始转向大规模 generative priors，特别是 video 和 3D 方向。这里有三类经历。

第一类是 product-facing 的 video generation research prototype。我们在 Adobe 内部很早开始做视频生成模型，也 co-founded 了 Kineto 这个 research prototype。这个 prototype 后来成为 Adobe Firefly Video 后续研发的重要基础之一。对我来说，这段经历很有价值，因为它不仅是 research，也直接连接到 product direction。它让我看到一个模型从 research prototype 到真实 creative tool 中间需要解决哪些问题。

第二类是 video foundation model research，比如 HARIVO。它的核心问题是如何 harness image generative priors for video。也就是说，在 image model 已经很强的情况下，怎么把这些 prior 延展到 temporal domain，让它们能够生成高质量、时间一致的视频。

第三类是 3D foundation model，比如 LRM。LRM 做 single-image-to-3D reconstruction，把 3D generation 也放进 foundation model 的框架里看。

这三条线合在一起，代表了我进入 foundation model era 的过程：既有大模型 research，也有从 research prototype 到 product impact 的经历。

[click]

---

## 07. Foundation Priors for Creative Applications

当 foundation model 逐渐足够强之后，我的兴趣又开始回到 application，但这次和早期 specialist model 不一样。

早期我们是为每个任务单独设计模型；而现在的问题是，如何把 large foundation prior 用到具体、精细、可控的 creative tasks 里面。

比如在 digital human 方向，foundation priors 可以让 identity、body、clothing、pose 这些因素更容易被编辑，而不需要为每一个因素重新训练一个完整 specialist stack。

在 spatial and temporal super-resolution 方向，大模型 prior 可以帮助恢复 texture 和 temporal detail。传统 SR 很容易被看成一个 local signal problem，但视频里的 high-frequency detail、temporal coherence、realism，其实都很依赖 generative prior。

在 generative blending 或 video inbetweening 里，模型需要把 semantic、motion、appearance 和 temporal prior 融合起来，让 transition 不像是拼接出来的，而是自然连续的。

最后是 customization。这里的问题是如何把一个 general video prior 适配到用户指定的 subject、motion 或 style，同时不要丢掉 foundation model 本身的泛化能力。

所以这一阶段的核心是：foundation model 不是终点，它的价值在于成为一个可控、可适配、可用于 creative workflow 的 prior。

[click]

---

## 08. World Model

接下来进入第三阶段：World Model。

在 foundation model 解决了很多生成质量和内容覆盖的问题之后，一个新的瓶颈开始变得越来越明显：control 会自然带来 long video generation。

如果用户只是输入一个 prompt，让模型生成几秒钟视频，那么问题相对简单。但一旦用户想控制 camera、action、trajectory，或者想在一个场景里持续探索，模型就必须生成更长的视频，并且在 long horizon 里保持一致。

我的 video world model journey 大致就是从 long video generation 开始的。第一步是 Progressive Autoregressive Video Diffusion Models，关注如何把短视频扩展成长视频。第二步是 WorldCam，引入 camera pose 作为 action control 和 3D memory 的统一表示。第三步是 RELIC，更接近 interactive video world model，强调 long-horizon memory 和 real-time streaming。

所以我对 world model 的理解不是一个突然出现的新名词，而是一个逐步加 constraint 的过程：先要长，再要可控，再要有 memory，最后还要 real-time。

[click]

---

## 09. WorldCam

接下来我稍微 deep dive 一下 WorldCam。

WorldCam 的 motivation 可以分成两个。

第一个是 more precise control。对于一个 interactive world，用户需要一种连续、精确的方式来控制生成过程。特别是在 navigation-style 的世界里，用户不是简单输入一句 semantic command，而是会有键盘、鼠标、camera movement 这些复杂、连续、互相耦合的 action。

第二个是 3D world consistency。一个世界模型不能只是往前生成新的 frame，它还需要在 camera 移动、回头、revisit 同一个位置的时候，保持 underlying 3D scene structure 的一致。

我们最后通过实验发现，camera pose 可以作为这两个 motivation 的 unified representation。一方面，它可以表达用户 action；另一方面，它也可以作为 memory retrieval 的 address，让模型知道现在的 view 和过去哪些 observation 是相关的。

所以 WorldCam 的核心 insight 是：camera pose 不只是一个 control signal，它也是连接 action control 和 3D-consistent memory 的桥。

[click]

---

## 10. Model Architecture

这一页是 WorldCam 的 architecture。

整体来说，WorldCam 会先把用户的 action 转成 camera poses。这里 camera pose 用 Lie algebra 表示，这样它可以比较自然地表达 continuous camera motion。然后这些 camera poses 会作为 condition 输入到 progressive autoregressive video transformer 里，帮助模型进行 precise action control。

但如果只有 action condition，还不够解决 long-horizon consistency。因为模型生成到后面时，还是可能忘记之前的场景。所以 WorldCam 里面有 memory pool。长期 memory 会保存过去的 latent 和 camera pose，当当前 camera pose 和过去某些 view 相关时，模型可以 retrieve 对应的 memory，从而保持 3D consistency。

同时，模型也需要 short-term memory，因为相邻时间窗口之间的稳定性也很重要。我们还使用 attention sink 来稳定 long-horizon generation。

所以这页我想强调的是，WorldCam 不是只加了一个 camera condition。它真正的结构是：camera pose condition、long-term memory、short-term memory 三者结合。Camera pose 是中间的 bridge：它一边连接用户 action，一边连接 memory retrieval 和 3D consistency。

[click]

---

## 11. Precise Action Control over Long-Horizon Generation

这一页展示的是 precise action control。

这里的关键点是，用户输入不是一个简单的离散 command，而是 complex and entangled input。比如 keyboard 控制移动方向，mouse 控制 camera rotation，这些输入是连续变化的，并且在时间上互相耦合。

WorldCam 可以把这些 action 转成 camera pose trajectory，然后让视频生成跟着这个 trajectory 走。这样模型生成的不只是一个“看起来像游戏”的视频，而是一个可以被用户 action 驱动的视频 rollout。

这对 world model 很重要，因为真正的 interactive system 不能只接受 high-level text prompt。它必须能响应 low-level control，并且在 long horizon 里持续稳定。

这一页的 demo 想说明的是：action control 可以变得更 precise，也可以变得更接近真实 interactive environment 中的 input interface。

[click]

---

## 12. 3D World Consistency over Long-Horizon Generation

这一页展示的是 3D world consistency。

对于 long-horizon generation，最常见的问题是 drift。模型一开始生成得很好，但随着时间变长，场景会慢慢变形，物体会消失，或者当 camera 回到之前的位置时，世界已经不是同一个世界了。

WorldCam 希望解决的是：当 agent revisit 同一个 location，尤其是从类似 view angle 观察时，场景应该保持 recognizable and spatially consistent。

这里 camera pose 和 memory retrieval 非常关键。因为 camera pose 提供了一个几何意义上的 address，模型可以知道当前 view 应该和过去哪个 memory 对齐。

这也是我为什么认为 world model 不能只靠 long context。Long context 是把更多 token 放进去，但 memory 需要 address、需要 retrieval、需要知道什么信息和当前 state 相关。WorldCam 是朝这个方向迈出的一步。

[click]

---

## 13. Future Work Problems

从 WorldCam 和其他 concurrent world model work 里，我觉得下一阶段并不是一个单独算法可以解决的，而是一个 coupled stack。

第一是 drifting。长时间生成里，error accumulation、identity drift、revisiting failure 都是很核心的问题。我们已经在一些工作里做了尝试，但它仍然是 long horizon world model 的 stress test。

第二是 action control。WorldCam 通过 camera pose 把 navigation control 往前推了一步，但更广义的 action 还远不止 camera movement。未来模型需要理解 object interaction、agent behavior、environment change 等更复杂的 action interface。

第三是 world state。这个是我现在最关注的方向之一。模型需要一个 representation 来记录发生了什么、什么被改变了、什么之后可以被 revisit。

第四是 realtime distillation。一个 high-quality video world model 如果需要很多 denoising steps，它就很难成为真正 interactive system。我们需要把高质量生成压到 low latency、few-step、甚至实时。

所以这四个方向不是分开的。Stability、control、state、speed 必须同时成立，world model 才能真正从 video generator 变成 interactive world system。

[click]

---

## 14. World State

这一页展开讲 World State。

我认为 world state 是 world model 里非常核心的 representation。它记录的不只是当前 frame 长什么样，而是整个世界发生过什么、每个地方有什么状态、哪些内容之后需要被 revisit。

在目前一些工作里，比如 WorldCam 或 RELIC，state bank 主要还是记录 camera geo location、view angle、POV，以及一些 compact appearance cues，比如 CLIP embedding。这已经能帮助模型做一些 memory retrieval。

但如果我们想支持更复杂的 world model，state 需要更丰富。它可能需要 scene-level memory、object-level memory、actor-level memory、event memory，以及 camera-indexed memory。也就是说，它不只是“我在哪里看过什么”，而是“这个地方发生了什么、哪些 object 改变了、哪些 actor 做过什么”。

另一个关键点是 updater。World state 不是静态地图，它是 spatial-temporal 的。它既要 register 到 location，也要随着 time evolve。一个 object 被移动了，一个 actor 经过了，一个事件发生了，这些都应该更新 state。

所以 world state 的难点在于：它既是 memory，又是 evolving representation。

[click]

---

## 15. World State Active Work

这一页是我们现在 active working on 的两个 internship projects。

第一个方向是 latent state learning。现在如果直接做 raw memory retrieval，需要保存大量 frame 或 latent，而且 redundancy 很高。更重要的是，current frame-based retrieval 很容易被 heuristic rule dominate。比如只按 camera distance 或 view similarity 去检索，可能会错过真正对当前 generation 有用的 memory。

所以我们希望通过 encoder 学一个 compact world-state representation，把 raw retrieval 变成 latent retrieval。这样 memory 可以更 compact，retrieval 也可以更 adaptive、更 robust，最终支持更长 horizon 的 memory。

第二个方向是 multiplayer synchronization。这里的目标是让多个 player 看到同一个 evolving world。每个 player 有不同 camera trajectory、不同 view、不同 action，但他们共享一个 world state。

这就要求系统不仅有 shared world state，还要在不同 player 之间做 synchronization。未来如果要 scale 到 arbitrary number of players，系统必须设计一种可扩展的 state update 和 cross-player communication mechanism。

所以这两个 project 对应 world state 的两个面：一个是如何 compress and retrieve memory，另一个是如何 share and synchronize state across agents。

[click]

---

## 16. World State Summary

这一页是对 world state 的总结。

我把 world state 理解成 world model 底下的 map。这个 map 不只是几何地图，也不是简单的 frame cache。它需要记录每个地方长什么样，那里发生过什么，什么改变了，以及哪些状态以后需要被记住。

这里有两种可能的路线。

第一种是 learned state，也就是 model-native memory。模型自己生成、压缩、存储、检索 latent memory。这个方向更像是一个 fully generative world model，所有 memory 都是模型内部学出来的 representation。

第二种是 engine-backed state，也就是 external world host。比如 3D engine、game engine 或 physics engine 维护 geometry、physics、state 和 metadata。视频 world model 则更像一个 renderer，把 engine 里的 abstract state，加上 context，渲染成 rich realistic 或 stylized video。

我觉得这两种路线并不冲突。它们的区别在于 state 是由模型自己生成并记住，还是由外部 engine 维护。但最后，两条路线都可以使用 video model 作为 renderer。

这也给了我们一个更宽的视角：world state 不一定只能是 autoregressively generated latent，它也可以是一个被 engine host 的 structured state。

[click]

---

## 17. Realtime Future Focus

另一个我非常关注的 future focus 是 real-time。

如果 world model 不能实时，它就很难 interactive。用户 action 之后，如果模型需要几秒钟甚至几十秒才能生成反馈，那它更像一个 batch video generator，而不是 world model。

所以 real-time 的关键不是单纯 FPS，而是 low latency closed loop。用户 act，模型 observe state，update memory，render next frames，然后用户继续 act。这个 loop 必须足够快，用户才会感觉自己真的在和一个世界互动。

我们现在 active working on 的方向是 consistency distillation with quality regularization。目标是把 sampling steps 降下来，比如从 many-step teacher 变成 few-step student。Consistency distillation 可以减少步数，但如果只追求 consistency，有时候 frame quality 会不够。因此我们也考虑 DMD 和 GAN-style objectives 来提升 frame sharpness 和 perceptual quality。

这里相关的 paper stack 包括 CausVid、Self-Forcing、Causal Forcing++，以及 consistency models、sCM、rCM、DMD/DMD2、LongLive-2.0、FlashDecoder 等。

我的理解是，real-time world model 不是一个单独 acceleration trick，而是 generation quality、causal streaming、few-step distillation、decoder latency 共同优化的结果。

[click]

---

## 18. Changing the World

最后我想用一页讲一下 vision。

如果 video world model 变得 stateful、controllable、consistent、and real-time，它就不再只是 media generator，而会变成 interactive simulation engine。

第一个应用是 realtime editing。创作者不再需要反复生成一段 clip，而是可以在一个 persistent scene 里面实时编辑、调整、重塑世界。

第二个是 digital companion。实时 talking characters 可以听、说、回应、表达情绪，并且在视觉上持续存在。这和传统 talking head 不一样，因为它需要 memory、interaction 和 real-time rendering。

第三个是 games。未来游戏世界的一部分可能不再完全依赖 hand-authored assets，而是由 world model 生成和扩展。但多个 player 必须看到 coherent shared world，所以这又回到 world state 和 multiplayer synchronization。

第四个是 robotics。Robotics 可以用 real-time world models 做 interactive action and planning，比如 world action model：在真实行动之前，先预测不同 action 的后果。

所以我认为，video world model 的长期影响不只是生成更好看的视频，而是让我们拥有一种新的方式来构建、探索和控制动态世界。

[click]

---

## 19. Q&A

这就是我今天想分享的内容。

简单总结一下，我的 research trajectory 是从 digital human 的 fine-grained control 出发，进入 video and 3D foundation model，再把 foundation priors 用到 creative applications，最后走向 interactive video world models。

我现在最关心的是 world state 和 real-time，因为我认为它们是 video world model 从 demo 走向真正 interactive system 的关键。

谢谢大家，我很期待接下来和大家讨论。

