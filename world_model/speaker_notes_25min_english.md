# World Model Research Interview Talk Script

English speaker notes based on Yang Zhou's current interactive deck.

Working target: around 25 minutes total, with a not-too-fast speaking pace. This file will be built section by section.

---

## 01. Yang Zhou

Hello everyone. I'm Yang. I'm a Senior Research Scientist at Adobe Research.

In today's talk, I would like to introduce my research trajectory, and explain why I have become increasingly interested in video world models.

If I summarize my research in one sentence, I would say that I build controllable models for dynamic visual worlds: from controlling a character, to controlling a video, and finally to controlling a visual world that can be explored, revisited, and shared by multiple players.

[click]

---

## 02. Research Identity

Let me first give a brief overview of my research identity.

My research focuses on developing foundation models for video generation, video effects, and digital avatar applications. More specifically, I work toward models that can generate, edit, and reason over dynamic visual content. I also have several years of experience in both large-scale generative modeling and downstream creative applications.

I joined Adobe Research right after my PhD, During my time there, I have worked on several connected directions.

The first direction is video generation foundation models. I co-founded one of Adobe's earliest video generation research prototypes, which later contributed to the development of Adobe Firefly Video.

The second direction is digital avatars, I led research and development on video models for talking avatars, lip sync, pose transfer, and facial expression transfer. 

The third direction is video effects and video enhancement. I led research and development on spatial and temporal super-resolution, as well as a generative blending project. 

Across these directions, some projects stayed as research prototypes, while others were transferred into products.


Over the past one and a half years, my focus has shifted more toward video world models. This includes long-form video generation, efficient video synthesis, world-state and memory consistency, and more recently, multi-player world modeling.

[click]

---

## 03. Talk Map

Today's talk will cover four main parts.

The first part is digital human. This is where my research started. I will briefly cover work on human and character animation.

The second part is video foundation models and their applications. I will talk about how I moved from specialist models to foundation models, and how I later used foundation model priors to improve downstream creative applications.

The third part is video world models. This is the key part of the talk, and it explains why I am currently excited about this direction. 

The last part is future directions. I will discuss what I think are the most important problems in the next stage of video world models. I will also talk about where I am placing my active research bets.

[click]

---

## 04. Research Era Timeline

This page shows my research era timeline.


[click]

---

## 05. Digital Human

The first stage is digital human.

In this stage, my work covered a range of control and analysis problems around human faces, bodies, hands, and stylized characters. This includes human pose transfer, talking-head animation, hand grasping, body estimation, and character animation.

One of my favorite projects from this period is MakeItTalk. It is a talking-head animation system: given an input audio signal and a target face, the model generates a talking-head video as output.

Today, generating talking avatars may feel like a common problem. We now see many video generation models that can do that. But back in 2018, this was still a very early direction. Very few people were working on this kind of cross-modal generation from audio to facial motion and video. Our work was among the first several papers exploring this problem, and it became a very inspiring and successful project at that time.


All these digital human experience became very important for my later research journey. It made me believe that no matter how strong a generative model becomes, we eventually have to come back to controllability and problem definition. A large generative model can provide a strong prior, but a useful system still needs accurate control that can actually be used in production or business scenarios.

[click]

---

## 06. Foundation Models

The second stage is foundation models.

After working on specialist models for many years, I started to move toward larger generative models, especially for video and 3D.

The first major experience here was a product-facing video generation research prototype at Adobe. We were one of the earliest groups working on video generation, not only within Adobe, but also among the broader industry at that time. I co-founded Kineto, an internal research prototype for video generation. This work later contributed to Adobe Firefly Video and served as one of the important research foundations for the product direction.

To me, this experience was extremely valuable because it was the first time I helped start a research prototype and watched it grow into a highly impactful product-facing technology. 

I also have research papers about video foundation model HARIVO, and 3D foundation models, such as LRM, which focuses on single-image to 3D reconstruction. 


[click]

---

## 07. Foundation Priors for Creative Applications

Once foundation models become strong enough, the next question is how to use their priors to solve precise creative tasks and downstream applications. This is where my research shifted back toward applications.

I explored this idea across several directions, like .....

The broader lesson from this stage is that foundation models are powerful, but the most interesting part is how we combining foundation priors with precise control. That is also one of the reasons I naturally moved toward world models later: world models require strong priors, but they also require control, memory, and state.

[click]

---

## 08. World Model

The third stage is world models.

After foundation models started to solve many problems around video quality and content generation, a new bottleneck became more and more important: long video generation.

Generating a few seconds of video is a relatively well-defined problem. But once the user wants to control the camera, trajectory, or continuously explore a scene, the problem becomes much harder. The model now needs to generate a much longer video, respond to control signals, and stay consistent over a long horizon.

So my journey into video world models started from long video generation.

The first paper in this direction was Progressive Autoregressive Video Diffusion Models, or PAVDM. The goal there was to extend short video generation into long-form video generation, while reducing error accumulation over time.

Then, in WorldCam and RELIC, the problem became closer to what we now call video world models. It was no longer only about making the video longer. We also started to add action and camera control, 3D-aware long-horizon memory retrieval, and real-time streaming design.

Since there are authors from Roblox here, I will deep dive more into WorldCam.

[click]

---

## 09. WorldCam

WorldCam is a first-person-view video game generation model.

We had two main motivations for this paper.

The first motivation is more precise control for interactive generation. In an interactive world, the user needs a continuous and accurate way to specify how the camera or the agent moves through a generated scene. Text prompts alone are not enough. The model needs to respond to low-level actions, camera motion, and view changes.

The second motivation is 3D world consistency. A world model should not only generate new frames as the camera moves forward. It should also remain spatially coherent when the camera rotates, moves around, and revisits the same place from a similar view angle.

Through our experiments, we found that camera pose can serve as a unified representation for both motivations. On one side, camera pose provides a precise control signal for user action. On the other side, it gives memory a geometric address: it tells the model where the current view is, and which past observations may be relevant.

So the core idea of WorldCam is that camera pose is not just a condition for generation. It is also the bridge between action control and 3D-consistent memory.

[click]

---

## 10. Model Architecture

This page shows the architecture of WorldCam.

At a high level, WorldCam first converts user actions into camera poses. These camera poses are then used as conditioning signals for the video generation model.

For the base generation model, we build on our previous work, PAVDM, as the progressive autoregressive video generation backbone. This allows the model to generate beyond a short denoising window and support long-horizon video synthesis with reduced error accumulation.

But action conditioning alone is not enough. If the model only knows the next camera motion, it may still forget what it generated before. So we introduce a memory pool, or long-term memory.

This long-term memory stores previously generated latents, together with their registered information, such as camera pose, view location, and compact appearance cues. When the target camera pose for future generation is related to some past views, the model can retrieve the corresponding memory and inject it as reference tokens during video generation.

At the same time, the model also needs short-term memory. This is the immediate previous generated latent, or a nearby cache, which helps keep local temporal stability from one generation window to the next.

Finally, we also use an attention sink to further reduce drifting during long-horizon generation.

So to summarize, WorldCam is not simply adding camera pose as another condition. Its structure combines camera-pose conditioning, short-term memory, and long-term memory retrieval. Camera pose is the bridge: it connects user action on the control side, and memory retrieval on the consistency side. That is why we call it WorldCam.

[click]

---

## 11. Precise Action Control over Long-Horizon Generation

This page shows the precise action control enabled by WorldCam.

The key point is that the control signal here is much more challenging than a simple discrete action label. In our data, the user input contains fast-changing and highly entangled controls: keyboard inputs such as W, A, S, and D control the movement direction, while mouse motion continuously controls the camera rotation.

These controls change at a high frequency, and the mouse movement can be especially fast and sensitive. Small errors in camera rotation can quickly become visually obvious, because the whole view direction changes. So the model must learn a very precise mapping from these noisy, continuous, and entangled user actions to the generated video.

In the examples on this slide, the agent moves and turns quickly through the scene. Compared with many video generation demos where the motion is slow or mostly pre-defined, this setting puts much stronger pressure on action following. The model has to follow both the keyboard trajectory and the mouse-controlled camera trajectory while keeping the generated video coherent.

So the main message here is that WorldCam can support precise low-level control under fast action changes, which is an important requirement for interactive world models.

[click]

---

## 12. 3D World Consistency over Long-Horizon Generation

This page shows 3D world consistency in WorldCam.

In the first row, we manually constructed revisiting camera trajectories. The camera moves away and then comes back to a similar location and view angle. If the model has no memory or no spatially meaningful retrieval, it may generate a completely different scene when it revisits the same place.

But here, we can still observe similar 3D structures and detailed textures after revisiting the same camera location and view direction. This suggests that the model is not only extending the video forward, but also using memory to preserve the underlying scene structure.

This is why I think memory in a world model cannot just be a long context window. Memory needs an address. It needs retrieval. It needs to know which past information is relevant to the current state.

Camera pose provides one possible address for this memory. It registers where each memory was generated, what view it corresponds to, and how it should be reused when the agent comes back to a related location.

WorldCam is one step in this direction: using camera pose to connect action control, memory retrieval, and 3D-consistent long-horizon generation.

[click]

---

## 13. Future Work Problems

Now I want to move to the final part: future directions.

I think video world models still have several important problems to solve.

The first one is drifting. We have tried many solutions, but I still think this problem cannot be fully avoided yet. Generating minute-long, or even infinitely long, videos without accumulated errors remains very challenging.

The second one is action control. Simple controls, such as camera movement or rotation, are becoming more feasible. But broader actions, such as object interaction, agent behavior, and environment changes, still need better action interfaces and better model design.

The third one is world state. This is one of the directions I am most interested in. A world model needs a representation to record what happened, what changed, and what should be revisited later.

The last one is real-time distillation. A high-quality video world model cannot rely on many denoising steps if it wants to be interactive. It needs to run with low latency.

[click]

---

## 14. World State

One direction I am actively working on is world state.

I think world state is a key representation problem in world models. It should not only record what the current frame looks like. It also needs to record what happened, what the state is at different locations, and what information may need to be revisited later.

In many current works, such as WorldCam or RELIC, the state bank mostly records camera geo-location, view angle, POV, and compact appearance cues. This can support some basic memory retrieval, but it is not enough for more complex world models.

For a richer world model, the state should be more informative. It may need scene-level memory, object-level memory, actor memory, event memory, and camera-indexed memory.

Also, world state is not just a static map. It is spatial-temporal. It needs to register states to locations, but it also needs to update those states as time evolves.

So the hard part of world state is that it is both a memory and an evolving representation.

[click]

---

## 15. World State Active Work

This page shows two active internship projects around world state.

The first direction is latent state learning. If we only do raw memory retrieval, we need to store many frames or latents, and there is a lot of redundancy. This project tries to learn a compact world-state representation with an encoder, so that we can move from raw retrieval to latent retrieval. The goal is to make memory more compact, and retrieval more adaptive and robust than heuristic rule-based methods.

The second direction is multiplayer synchronization. The goal is to let multiple players share a single evolving world state. Even if each player has a different camera trajectory, they should still observe consistent views from the same shared world.

These two projects attack world state from two sides: one focuses on compact memory and retrieval, and the other focuses on shared state across multiple agents or players.

[click]

---

## 16. World State Summary

This page summarizes how I think about world state.

I understand world state as the map underneath the world model. But this map is not just a static map, and it is not just a frame cache. It is an evolving state that records what each place looks like, what happened there, and what has changed.

I think there are two possible routes to achieve this.

The first route is learned state, or model-native memory. This is what many current works are exploring. The model generates, compresses, stores, and retrieves latent memory by itself. In this route, the memory is learned inside the generative model.

The second route is engine-backed state, or an external world host. This route is especially relevant to game platforms. A game engine or 3D engine can maintain geometry, physics, states, and metadata. The video world model then acts more like a renderer: it turns the abstract engine state, together with context, into rich realistic or stylized video.

I do not think these two routes conflict with each other. They define and maintain the state in different ways, but both can use video world models as the final renderer.

[click]

---

## 17. Realtime Future Focus

Another future direction I am very interested in is real-time generation.

If a world model cannot run in real time, it cannot truly be interactive. After a user takes an action, the model needs to respond immediately. So real-time is not only about FPS. It is also about a low-latency closed loop between user action and generated pixels.

We are actively working on this direction through consistency distillation with quality regularization. The goal is to design a simpler training recipe that can distill a many-step teacher into a few-step causal student.

This direction connects to many recent papers on causal video generation and consistency distillation. The broader goal is to improve speed at multiple levels of the system, while keeping the generated video stable and high quality.

[click]

---

## 18. Why Roblox?

To close the talk, I want to connect this vision back to Roblox.

I think Roblox is a very natural place for video world model research, because Roblox is already a world platform. It already has persistent worlds, game state, physics, avatars, creators, and multiplayer social interaction.

This connects directly to the external world host idea I mentioned earlier. Instead of asking the generative model to learn and store the entire world state by itself, a platform like Roblox can maintain a large part of the state through the engine: geometry, physics, metadata, player state, and interaction rules.

Then the video world model can become the renderer on top of that state. like rendering state into different visual styles, from realistic real-world appearance to cinematic or stylized worlds, in real time.


About other directions, such as multiplayer worlds, world action models, digital companions, and creator tools, can also be important Roblox.

So for Roblox, I think the opportunity is not only to generate better videos. It is to connect generative models with an existing interactive world platform, and build the next generation of controllable, stateful, real-time experiences.

[click]
