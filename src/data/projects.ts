/**
 * Featured work.
 *
 * Three project areas (SameFace, SCAMS, CARLA / ROS 2) plus one professional
 * case study (Rockstar Games technical QA). Nothing else is presented as a
 * portfolio project: interests are covered in the interest map, not here.
 *
 * `statusKind` distinguishes built work from proposals and professional
 * experience, and each entry carries one scope note. The figures are original
 * illustrations drawn in this repo, labelled as such once per page.
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
  /** the part that took the most thought, in one line */
  challenge: string
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
      'SameFace is about resemblance: capture a face, compare it with others, and surface the people who look similar. The design is documented in a research paper — ML Kit does face and landmark detection on device, Firebase handles storage and accounts, and the scoring that would turn landmarks into a match is written up as the next step.',
    period: 'Research paper · student project',
    challenge:
      'ML Kit returns landmark coordinates, not a face embedding, so the comparison step needs a method of its own.',
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
    figureCaption: 'Landmark diagram — original illustration',
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
        heading: 'How it is put together',
        body: [
          'The paper (Section IV) splits the system into four parts behind the Android app: data storage, similarity matching, authentication and user communication. Each can be reasoned about — and replaced — on its own.',
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
          'Worth being exact about, because the vocabulary here is slippery. ML Kit\u2019s on-device Face Detection API returns a bounding box per face, landmark coordinates (eyes, nose, mouth, ears, cheeks), contours, and classification signals such as smiling probability.',
          'It does not return a face embedding, and it contains no comparison or scoring function. Detection gives numbers describing where features are in an image; it does not give a vector describing who the face is. The paper groups detection, landmarks and \u201cface recognition\u201d under its FaceKit heading, but the public API stops at the first two. A similarity judgement therefore needs a separate method — either comparing landmark geometry directly, or running the face through an embedding model trained for verification and comparing vectors in that space.',
        ],
      },
      {
        heading: 'Documented, in development, or proposed',
        body: [
          'This project spans a written design and the code that would follow it, so the three are separated here. Everything below comes from the paper.',
        ],
        bullets: [
          'Documented design — the component architecture, ML Kit face and landmark detection, Firebase storage, Firebase Authentication with OTP-based two-factor verification, explicit user consent for storing facial data, and chat over the realtime database.',
          'Described in the paper as being developed — the Android application itself, written in Kotlin and Java on Android Studio, with the five-step flow from registration through capture, storage and matching.',
          'Proposed or future work — the custom ML similarity algorithm (the paper is explicit that this is planned for a future implementation), embedding-based recognition models, iOS support via a cross-platform framework, stronger encryption and anonymisation, a matching-accuracy feedback mechanism, and social sharing.',
        ],
      },
      {
        heading: 'Evaluation',
        body: [
          'The paper\u2019s evaluation section is prospective: it describes how the app could be evaluated — matching accuracy against ground-truth data, and user surveys — rather than reporting results. No accuracy figures or user testing appear in it, so none are claimed here. The paper does name the hard cases: lighting, pose and age all degrade matching.',
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
        'Architecture as documented in the paper. Select a stage for what the paper says about it.',
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
            'The scoring layer. The paper is explicit that a custom similarity algorithm is planned for a future implementation. ML Kit itself provides no embeddings and no comparison function.',
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
      label: 'Source',
      text:
        'Summarised from the SameFace research paper (Rahul Raj, Presidency University). The similarity algorithm, evaluation results and iOS support are future work in that paper and are shown here as future work.',
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
    challenge:
      'Designing the response — risk model, escalation path and governance — before building any of it.',
    technologies: ['Project management', 'Risk assessment', 'Alerting workflow', 'Governance', 'Pilot evaluation', 'Hybrid delivery'],
    figure: 'scams-workflow',
    figureCaption: 'System and escalation flow — original illustration of the proposed design',
    sections: [
      {
        heading: 'The problem being framed',
        body: [
          'Tele-fraud aimed at students is a trusted-voice problem as much as a technical one: messages that arrive looking like they come from a bank, a landlord, a university or an employer, at exactly the moment a student is least equipped to check them.',
          'The project framed the response around speed and clarity: recognise the pattern, decide how risky it looks, and tell someone in time to be useful.',
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
          'The work sat in an academic project-management setting, which shaped it as much as the technical design did: staged delivery, explicit scope boundaries, governance over student data, and a pilot plan rather than a rollout.',
          'Planning used hybrid methods — structure where the requirements were known, iteration where they were still being worked out.',
        ],
      },
      {
        heading: 'What stage this reached',
        body: [
          'This is design work: the risk model, the escalation path and the governance around student data were planned and written up, and a pilot was scoped. Nothing was built or deployed, and there are no measured detection results.',
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
      label: 'Status',
      text:
        'Academic proposal and pilot design, not deployed software: no operational integrations, no detection accuracy and no user numbers exist for it.',
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
    challenge:
      'Keeping the steering usable across the whole speed range, which is what the dynamic look-ahead is for.',
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
          'This is simulation work, described at the level of the architecture and the control approach. There are no benchmark figures or measured performance improvements to report.',
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
      label: 'Status',
      text:
        'Holds the control approach — waypoint following, PID control, dynamic look-ahead and turn detection — rather than a released product. No simulated benchmarks or performance claims are made.',
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
    challenge:
      'Writing a defect report clearly enough that someone else can reproduce it without asking me anything.',
    technologies: ['Technical QA', 'Functional testing', 'Regression testing', 'Defect reproduction', 'Stability & performance profiling'],
    figure: 'qa-performance',
    figureCaption: 'Performance profile — original illustration',
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
        heading: 'What I learned from it',
        body: [
          'Reproducibility is the whole discipline. A bug report is only as useful as the shortest path someone else can take to see the problem for themselves.',
          'The other thing was scale: at AAA size, quality comes out of consistent process and clear communication rather than any single pass over the build.',
        ],
      },
    ],
    disclaimer: {
      label: 'Confidentiality',
      text:
        'Professional experience, not a project I own. Nothing proprietary is described or depicted, and nothing here implies endorsement by Rockstar Games or any other employer.',
    },
    experienceId: 'rockstar',
  },
]

export const projectBySlug = (slug: string): Project | undefined =>
  projects.find((project) => project.slug === slug)
