/**
 * Featured work.
 *
 * Three project areas (SameFace, SCAMS, CARLA / ROS 2) plus one professional
 * case study (Rockstar Games technical QA). Nothing else is presented as a
 * portfolio project: interests are covered in the interest map, not here.
 *
 * Honesty rules baked into the data model:
 *  - `statusKind` distinguishes built work from proposals and experience.
 *  - every project carries a `disclaimer` that is rendered prominently.
 *  - the figures are original illustrations generated in this repo. They are
 *    never described as screenshots of Rahul's software.
 */

export type ProjectCategoryId = 'ai-ml' | 'systems' | 'academic' | 'gaming-qa'

export type ProjectStatusKind =
  | 'student-project'
  | 'academic-proposal'
  | 'study-exploration'
  | 'professional-experience'

export type FigureKind =
  | 'sameface-landmarks'
  | 'sameface-architecture'
  | 'scams-workflow'
  | 'carla-control'
  | 'qa-performance'

export interface ProjectSection {
  heading: string
  body: string[]
  bullets?: string[]
}

/**
 * Maturity of a single stage of a documented system. Rendered as a chip in the
 * interactive diagram so the three tiers are distinguishable at a glance, in
 * words rather than colour alone.
 */
export type StageStatus = 'documented' | 'in-development' | 'proposed'

export interface ProjectDiagram {
  kind: FigureKind
  heading: string
  caption: string
  stages: {
    id: string
    label: string
    detail: string
    status: StageStatus
  }[]
}

export interface Project {
  slug: string
  title: string
  /** full name / expansion, shown under the title */
  subtitle: string
  category: ProjectCategoryId
  statusKind: ProjectStatusKind
  /** short label rendered in the status chip */
  statusLabel: string
  /** context line, e.g. role or setting */
  context: string
  role: string
  summary: string
  /** one paragraph for the detail page lede */
  lede: string
  period: string
  technologies: string[]
  figure: FigureKind
  figureCaption: string
  /** true when the card should span two columns in the grid */
  wide?: boolean
  /** true for the entry that is a description of a job rather than a project */
  caseStudy?: boolean
  sections: ProjectSection[]
  /** ordered pipeline / control-loop steps rendered as a technical list */
  steps?: { title: string; detail: string }[]
  /** optional interactive, stage-selectable architecture diagram */
  diagram?: ProjectDiagram
  /** provenance line for the detail sidebar */
  sourceNote?: string
  disclaimer: { label: string; text: string }
  /** cross-links to the experience timeline, where relevant */
  experienceId?: string
}

export const projectCategories: { id: ProjectCategoryId | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'ai-ml', label: 'AI / ML' },
  { id: 'systems', label: 'Systems' },
  { id: 'academic', label: 'Academic' },
  { id: 'gaming-qa', label: 'Gaming / QA' },
]

export const categoryLabel: Record<ProjectCategoryId, string> = {
  'ai-ml': 'AI / ML',
  systems: 'Systems',
  academic: 'Academic',
  'gaming-qa': 'Gaming / QA',
}

export const projects: Project[] = [
  {
    slug: 'sameface',
    title: 'SameFace',
    subtitle: 'Facial similarity matching on Android',
    category: 'ai-ml',
    statusKind: 'student-project',
    statusLabel: 'Student project',
    context: 'Android app project · documented in a research paper',
    role: 'Android development — Kotlin/Java, Firebase ML Kit, Firebase Authentication',
    summary:
      'An Android app project for facial similarity matching, documented in a research paper: Firebase ML Kit face and landmark detection on device, Firebase for storage and accounts, with the similarity scoring itself set out as planned work.',
    lede:
      'SameFace is about resemblance: capture a face, compare it with others, and surface the people who look similar. The design is documented in a research paper — ML Kit does detection and landmarks on device, Firebase handles storage and accounts, and the scoring that would turn landmarks into a match is described as the next implementation step rather than a finished component.',
    period: 'Research paper · student project',
    technologies: [
      'Kotlin',
      'Java',
      'Android Studio',
      'Firebase ML Kit',
      'Face detection',
      'Landmark detection',
      'Firebase Authentication',
      'Firebase Realtime Database',
      'OTP / 2FA',
    ],
    figure: 'sameface-landmarks',
    figureCaption: 'Conceptual landmark diagram — original illustration, not a screenshot',
    sourceNote:
      'Primary source: “SameFace App: Facial Similarity Matching using Firebase ML FaceKit”, a research paper by Rahul Raj, Department of Information Science and Engineering, Presidency University. Section references below point into that paper.',
    sections: [
      {
        heading: 'What SameFace is',
        body: [
          'SameFace is a mobile app project that stores and analyses face data in order to match users who share a resemblance. The paper frames the goal as a social one — showing people others who look like them — and places the interesting engineering in the comparison step rather than the capture step.',
          'It is developed in Kotlin and Java on Android Studio. The paper describes the app being built for Android with the Firebase stack underneath it: ML Kit for on-device face analysis, Firebase for storage, authentication and messaging.',
        ],
      },
      {
        heading: 'Documented architecture',
        body: [
          'The paper (Section IV) breaks the system into a small number of components: data storage, facial similarity matching, authentication and user communication, sitting behind the Android app itself. Keeping those concerns separate is what makes the design legible — each one can be reasoned about, and replaced, on its own.',
        ],
        bullets: [
          'Android app — Kotlin/Java on Android Studio, camera capture, matching UI and chat.',
          'Face data storage — captured facial data held in Firebase and associated with the user account.',
          'Similarity matching — the comparison layer. Described as using ML Kit\u2019s extracted features first, with a dedicated similarity algorithm planned on top.',
          'Authentication — Firebase Authentication, with two-factor verification by SMS or email OTP.',
          'User communication — real-time chat between matched users over Firebase\u2019s realtime database.',
        ],
      },
      {
        heading: 'What ML Kit does — and what it does not',
        body: [
          'This is the part worth being exact about, because the vocabulary in this field is slippery. ML Kit\u2019s on-device Face Detection API returns a bounding box for each face, landmark coordinates (eyes, nose, mouth, ears, cheeks), face contours, and classification signals such as smiling and eyes-open probability.',
          'It does not return a face embedding. Detection gives you numbers describing where features are in the image; it does not give you a vector describing who the face is, and it contains no comparison or scoring function. The paper groups detection, landmarks and "face recognition" together under the FaceKit heading, but the public Face Detection API stops at the first two.',
          'So a similarity judgement needs a separate method, and there are broadly two families. The first compares landmark geometry directly — cheap, explainable, and sensitive to pose and lighting. The second runs the face through an embedding model trained for verification and compares vectors in that space; the paper\u2019s related-work section cites exactly this approach in FaceNet and VGGFace.',
        ],
      },
      {
        heading: 'Documented, in development, or proposed',
        body: [
          'Because this project spans a design and the code that follows it, it is worth separating the three. Everything below is drawn from the paper; nothing further is claimed.',
        ],
        bullets: [
          'Documented design — the component architecture, ML Kit face and landmark detection, Firebase storage, Firebase Authentication with OTP-based two-factor verification, explicit user consent for storing facial data, and chat over the realtime database.',
          'Described in the paper as being developed — the Android application itself, written in Kotlin and Java on Android Studio, with the five-step flow from registration through capture, storage and matching.',
          'Proposed or future work — the custom ML similarity algorithm (the paper is explicit that this is planned for a future implementation), embedding-based recognition models, iOS support via a cross-platform framework, stronger encryption and anonymisation, a matching-accuracy feedback mechanism, and social sharing.',
        ],
      },
      {
        heading: 'Evaluation, as the paper sets it out',
        body: [
          'The paper\u2019s evaluation section is prospective. It describes how the app could be evaluated — matching accuracy measured against ground-truth data, plus user surveys for satisfaction, alongside system scalability — rather than reporting results that were obtained.',
          'No accuracy figures, evaluation outcomes, trained models or user testing are reported in the text, so none are claimed here. The paper does name the honest difficulties: lighting, pose and age all degrade matching, which makes robustness in detection, feature extraction and scoring the hard part of the problem.',
        ],
      },
      {
        heading: 'What I took from it',
        body: [
          'Writing it up forced a distinction I now use everywhere: separate what the tooling actually returns from what you want it to mean. A landmark is a coordinate. "These two people look alike" is a claim built on top of coordinates, and it needs its own method, its own error analysis and its own honesty about when it fails.',
        ],
      },
    ],
    steps: [
      {
        title: 'User registration',
        detail: 'An account is created with an email address or phone number, verified by OTP.',
      },
      {
        title: 'Face data capture',
        detail: 'The device camera captures the face; ML Kit detects it and extracts the relevant features.',
      },
      {
        title: 'Face data storage',
        detail: 'Captured facial data is stored in Firebase and associated with the user account.',
      },
      {
        title: 'Facial similarity matching',
        detail:
          'Stored facial data is compared to identify similar faces. This is the open part of the design: ML Kit stops at detection and landmarks, so a separate similarity method is required to produce a score.',
      },
      {
        title: 'Chat',
        detail: 'Once a match exists, users can message each other in real time over Firebase.',
      },
    ],
    diagram: {
      kind: 'sameface-architecture',
      heading: 'Architecture and flow',
      caption:
        'Architecture diagram based on the documented design — original illustration, not a screenshot. Select a stage to see what the paper says about it.',
      stages: [
        {
          id: 'capture',
          label: 'Capture',
          status: 'documented',
          detail:
            'The Android app (Kotlin/Java, Android Studio) takes an image from the device camera and prepares it for analysis on device.',
        },
        {
          id: 'detect',
          label: 'Detect',
          status: 'documented',
          detail:
            'ML Kit\u2019s face detection returns a bounding box for each face in the frame. This is the entry point to the whole pipeline.',
        },
        {
          id: 'landmarks',
          label: 'Landmarks',
          status: 'documented',
          detail:
            'Landmark and contour coordinates come back for the detected face — eyes, nose, mouth, ears and cheeks. Coordinates, not an identity.',
        },
        {
          id: 'store',
          label: 'Store & auth',
          status: 'documented',
          detail:
            'Facial data is held in Firebase against the user account, behind Firebase Authentication with two-factor OTP verification and explicit consent for storing facial data.',
        },
        {
          id: 'similarity',
          label: 'Similarity',
          status: 'proposed',
          detail:
            'The scoring layer. The paper is explicit that a custom ML similarity algorithm is planned for a future implementation, trained on a dataset of facial features. ML Kit itself provides no embeddings and no comparison.',
        },
        {
          id: 'chat',
          label: 'Chat',
          status: 'in-development',
          detail:
            'Matched users message each other in real time over Firebase\u2019s realtime database, closing the loop back into the Android app.',
        },
      ],
    },
    disclaimer: {
      label: 'Scope of this page',
      text:
        'Summarised from the SameFace research paper (Rahul Raj, Presidency University) as the primary source. Compared to that paper this page separates documented design from proposed work: the custom similarity algorithm, evaluation results and iOS support are described there as future work and are not presented here as built. No accuracy figures, trained models, user counts or production status are claimed. Every diagram on this page is an original illustration.',
    },
  },

  {
    slug: 'scams',
    title: 'SCAMS',
    subtitle: 'Student Scam Assessment and Mitigation System',
    category: 'academic',
    statusKind: 'academic-proposal',
    statusLabel: 'Academic project',
    context: 'University project management & data project',
    role: 'Project planning, system design and data framing',
    summary:
      'A student-focused tele-fraud and scam-prevention concept: scam-risk assessment, a student-facing app, real-time alerts and escalation, and a pilot evaluation plan.',
    lede:
      'SCAMS is an academic project about the scams that target students — especially new and international students arriving in a new country and a new financial system. It was developed as a project-management and data-focused university project covering scam-risk detection, a student application, real-time alerts and escalation, governance, and pilot evaluation.',
    period: 'University project',
    technologies: ['Project management', 'Risk assessment', 'Alerting workflow', 'Governance', 'Pilot evaluation', 'Hybrid delivery'],
    figure: 'scams-workflow',
    figureCaption: 'Conceptual system and escalation flow — proposed design, not deployed software',
    sections: [
      {
        heading: 'The problem being framed',
        body: [
          'Tele-fraud aimed at students is a trusted-voice problem as much as a technical one: messages that arrive looking like they come from a bank, a landlord, a university or an employer, at exactly the moment a student is least equipped to check them.',
          'The project framed the response around speed and clarity — recognising the pattern, deciding how risky it looks, and telling someone in time to matter.',
        ],
      },
      {
        heading: 'Proposed system',
        body: [
          'The design has four moving parts. A student-facing application is the entry point. Behind it, scam-risk assessment produces a risk signal for a reported message. That signal decides whether a real-time alert and escalation path is triggered, and to whom. Around all of it sits governance: who can see a report, what gets logged, and how the system is evaluated before anything is claimed about its effectiveness.',
        ],
        bullets: [
          'Student application — report a suspicious message, read guidance, receive advice.',
          'Scam-risk assessment — heuristics and data-driven signals that indicate risk.',
          'Real-time alerts and escalation — a defined path when risk crosses a threshold.',
          'Governance and pilot evaluation — scope, safeguards and how success would be measured.',
        ],
      },
      {
        heading: 'Project management approach',
        body: [
          'The work sat in an academic project-management setting, which shaped it as much as the technical design did: staged delivery, explicit scope boundaries, governance over student data, and a pilot plan rather than an immediate rollout.',
          'Delivery planning used hybrid methods — structure where the requirements were known, iteration where they were still being discovered.',
        ],
      },
      {
        heading: 'What is conceptual here',
        body: [
          'Everything visual on this page is a proposed design, not a screenshot. There is no deployed service, no operational integration with any bank, university or platform, and no measured detection accuracy — none of that has been claimed.',
          'What the project does represent is a structured attempt to design a response before building it: define the risk, define the escalation, define the ethics, then decide what to build.',
        ],
      },
    ],
    steps: [
      { title: 'Report', detail: 'A student submits a suspicious message, call or payment request through the application.' },
      { title: 'Assess', detail: 'Risk signals are evaluated — sender, wording, links, payment method, reported patterns.' },
      { title: 'Classify', detail: 'The report is grouped into a risk band: low, elevated or high.' },
      { title: 'Alert', detail: 'Elevated and high reports surface immediate, plain-language guidance to the student.' },
      { title: 'Escalate', detail: 'High-risk reports follow a defined escalation path to a support or advisory contact.' },
      { title: 'Learn', detail: 'Aggregated, de-identified patterns would inform guidance and campus awareness in a pilot.' },
    ],
    disclaimer: {
      label: 'Conceptual design',
      text:
        'SCAMS is presented as an academic proposal and pilot design. It is not deployed, it has no operational integrations, and no detection accuracy, fraud-prevention outcome or user count is claimed. The interface and flow shown are original illustrations of the proposed design.',
    },
  },

  {
    slug: 'carla-ros2-vehicle-control',
    title: 'CARLA / ROS 2',
    subtitle: 'Vehicle simulation and control',
    category: 'systems',
    statusKind: 'study-exploration',
    statusLabel: 'Study & exploration',
    context: 'Simulation work in CARLA with ROS 2',
    role: 'Python control nodes, PID tuning and waypoint logic',
    summary:
      'Autonomous-driving simulation work: ROS 2 nodes drive a CARLA vehicle along a waypoint route, using PID control, dynamic look-ahead and turn detection.',
    lede:
      'A vehicle in CARLA needs steering and throttle decisions every tick. This work built that loop in Python on ROS 2: pick a waypoint ahead of the vehicle, measure the error between where it is and where the path says it should be, feed that error to PID controllers, and let the simulation feed the result back.',
    period: 'Study & exploration',
    technologies: ['CARLA', 'ROS 2', 'Python', 'PID control', 'Waypoint following', 'Dynamic look-ahead', 'Turn detection'],
    figure: 'carla-control',
    figureCaption: 'Control-loop block diagram — original illustration of the architecture',
    sections: [
      {
        heading: 'The control problem',
        body: [
          'Path following is a closed loop: the vehicle is never exactly on the path, so the job is to keep the error small and the correction smooth. Steering and speed are two separate controllers, both driven by the same geometric picture.',
          'The vehicle state comes from the simulator, the desired state comes from the route, and the controllers live in between.',
        ],
      },
      {
        heading: 'Dynamic look-ahead',
        body: [
          'A fixed look-ahead distance behaves badly at both ends of the speed range: too twitchy when slow, too lazy when fast. Adjusting the look-ahead distance with speed — longer ahead when moving quickly, shorter when moving slowly — keeps the steering response usable across both.',
        ],
      },
      {
        heading: 'Turn detection and behaviour',
        body: [
          'Turns need earlier commitment than a straight line. Detecting them from the upcoming waypoint geometry lets the controller start steering into the corner before the heading error is large, and lets vehicle speed back off for the corner rather than during it.',
        ],
      },
      {
        heading: 'Notes on scope',
        body: [
          'This is simulation work, described at the level of the architecture and control approach. No benchmark figures, lap times or measured performance improvements are claimed, because the implementation status and measurements are not documented in the material available for this site.',
        ],
      },
    ],
    steps: [
      { title: 'Vehicle state', detail: 'Position, heading and speed are read from the CARLA simulation each cycle.' },
      { title: 'Waypoint selection', detail: 'The route is searched for the next target point ahead of the vehicle.' },
      { title: 'Dynamic look-ahead', detail: 'The look-ahead distance scales with speed so steering stays stable at both ends of the range.' },
      { title: 'Error computation', detail: 'Cross-track and heading error are derived between the vehicle pose and the target waypoint.' },
      { title: 'PID control', detail: 'Separate PID loops convert the errors into steering and throttle/brake commands.' },
      { title: 'Command & feedback', detail: 'Commands go back to the CARLA vehicle; the next state closes the loop.' },
    ],
    disclaimer: {
      label: 'Illustrative architecture',
      text:
        'This page documents the approach (CARLA, ROS 2, Python, waypoint following, PID control, dynamic look-ahead, turn detection and vehicle-control logic) rather than a released product. The diagram is an original illustration; no simulated benchmark results or performance claims are made.',
    },
  },

  {
    slug: 'rockstar-performance-qa',
    title: 'Rockstar Games India',
    subtitle: 'Technical QA case study',
    category: 'gaming-qa',
    statusKind: 'professional-experience',
    statusLabel: 'Professional experience',
    context: 'Sep 2025 – Jun 2026 · Bengaluru, India',
    role: 'Associate QA – Technical',
    summary:
      'A case study of my QA responsibilities — detailed testing, defect reporting, reproduction and regression support, and work with in-house profiling tools for stability and performance.',
    lede:
      'This entry is a description of a job, not a personal project. It covers what my technical QA work involved: finding and documenting defects, supporting reproduction and regression testing, and working with in-house profiling tools focused on stability and performance on the announced Grand Theft Auto VI project.',
    period: 'Sep 2025 – Jun 2026',
    technologies: ['Technical QA', 'Functional testing', 'Regression testing', 'Defect reproduction', 'Stability & performance profiling'],
    figure: 'qa-performance',
    figureCaption: 'Abstract performance profile illustration — not captured from any employer tool',
    wide: true,
    caseStudy: true,
    sections: [
      {
        heading: 'What the role involved',
        body: [
          'Technical QA sits between a build and the people who play it. The routine work is repeatable: exercise the software, notice when behaviour diverges from expected, and produce a description good enough that someone else can reproduce it.',
          'Alongside the standard work, I used in-house profiling tools focused on stability and performance — the instrumentation that helps explain why something behaves the way it does, not just that it did.',
        ],
        bullets: [
          'Detailed software testing across assigned areas of a AAA build.',
          'Identifying, documenting and prioritising issues so they could be actioned.',
          'Supporting defect reproduction, so that a report could be turned into a fix.',
          'Regression testing to confirm a change fixed one thing without breaking another.',
          'Working with in-house profiling tools for stability and performance.',
        ],
      },
      {
        heading: 'How this work is presented here',
        body: [
          'Everything on this page is my own account of my own responsibilities, written at a level that is safe and accurate. It contains no internal tooling, no developer processes, no unreleased content and no information about the game beyond what has been publicly announced.',
        ],
      },
      {
        heading: 'What the job taught me',
        body: [
          'Reproducibility is the whole discipline. A bug report is only as useful as the shortest path someone else can take to see the problem themselves.',
          'The second thing was tolerance for scale: at AAA size, quality comes from consistent process and clear communication rather than any single heroic pass over the build.',
        ],
      },
    ],
    disclaimer: {
      label: 'Confidentiality',
      text:
        'This is professional experience, not a product Rahul owns. No proprietary interface, tool or process is depicted; the illustration is an abstract diagram of this repository\u2019s own making. Nothing here implies endorsement by Rockstar Games or any employer.',
    },
    experienceId: 'rockstar',
  },
]

export const projectBySlug = (slug: string): Project | undefined =>
  projects.find((project) => project.slug === slug)
