import { makeEmail } from '../utils';

export const MAJORS = [
    'Computer Science',
    'Biology',
    'Business Administration',
    'Mechanical Engineering',
    'Psychology',
];

export const COURSES = {
    'Computer Science': [
        'CS 101 - Intro to Programming',
        'CS 201 - Data Structures',
        'CS 310 - Algorithms',
        'CS 340 - Operating Systems',
    ],
    Biology: [
        'BIO 110 - General Biology',
        'BIO 220 - Genetics',
        'BIO 315 - Cell Biology',
        'CHEM 121 - General Chemistry',
    ],
    'Business Administration': [
        'BUS 101 - Intro to Business',
        'ACCT 210 - Financial Accounting',
        'MKT 300 - Marketing Principles',
        'FIN 320 - Corporate Finance',
    ],
    'Mechanical Engineering': [
        'ME 101 - Engineering Fundamentals',
        'ME 210 - Statics',
        'ME 320 - Thermodynamics',
        'ME 350 - Fluid Mechanics',
        'ME 401 - Thermodynamic Systems and Applications',
    ],
    Psychology: [
        'PSY 101 - Intro to Psychology',
        'PSY 210 - Research Methods',
        'PSY 305 - Cognitive Psychology',
        'PSY 330 - Abnormal Psychology',
    ],
};

const hoursAgo = (h) => Date.now() - h * 3600 * 1000;

export function seedState() {
    const users = [
        // Computer Science
        { id: 'u1', name: 'Maya Chen', major: 'Computer Science', year: 1, role: 'student', bio: 'First-year CS student. Loves puzzles and hackathons.', courses: ['CS 101 - Intro to Programming'] },
        { id: 'u2', name: 'Jordan Patel', major: 'Computer Science', year: 2, role: 'student', bio: 'Sophomore, into web dev and competitive programming.', courses: ['CS 201 - Data Structures', 'CS 310 - Algorithms'] },
        { id: 'u3', name: 'Priya Raman', major: 'Computer Science', year: 4, role: 'mentor', bio: 'Senior & university peer mentor. Ask me about internships, algorithms, or surviving OS.', courses: ['CS 340 - Operating Systems'] },
        { id: 'u4', name: "Liam O'Connor", major: 'Computer Science', year: 3, role: 'mentor', bio: 'Junior, paid peer mentor for intro CS. Office hours Tue/Thu 3-5pm.', courses: ['CS 310 - Algorithms'] },
        { id: 'u5', name: 'Sofia Alvarez', major: 'Computer Science', year: 1, role: 'student', bio: 'Freshman. Switched from math, still figuring out pointers.', courses: ['CS 101 - Intro to Programming'] },
        // Biology
        { id: 'u6', name: 'Ethan Brooks', major: 'Biology', year: 1, role: 'student', bio: 'Pre-med track. Coffee-powered.', courses: ['BIO 110 - General Biology', 'CHEM 121 - General Chemistry'] },
        { id: 'u7', name: 'Grace Kim', major: 'Biology', year: 2, role: 'student', bio: 'Genetics is my thing. Looking for lab partners.', courses: ['BIO 220 - Genetics'] },
        { id: 'u8', name: 'Noah Williams', major: 'Biology', year: 4, role: 'mentor', bio: 'Senior peer mentor. Research assistant in the genomics lab.', courses: ['BIO 315 - Cell Biology'] },
        // Business
        { id: 'u9', name: 'Ava Thompson', major: 'Business Administration', year: 1, role: 'student', bio: 'Freshman. Interested in marketing and startups.', courses: ['BUS 101 - Intro to Business', 'ACCT 210 - Financial Accounting'] },
        { id: 'u10', name: 'Marcus Lee', major: 'Business Administration', year: 3, role: 'mentor', bio: 'Junior, paid mentor. Two internships in consulting.', courses: ['FIN 320 - Corporate Finance'] },
        // Mechanical Engineering
        { id: 'u11', name: 'Zoe Nguyen', major: 'Mechanical Engineering', year: 2, role: 'student', bio: 'Formula SAE team member.', courses: ['ME 210 - Statics', 'ME 320 - Thermodynamics'] },
        { id: 'u12', name: 'Daniel Okafor', major: 'Mechanical Engineering', year: 4, role: 'mentor', bio: 'Senior mentor. Thermo and fluids are my strong suits.', courses: ['ME 350 - Fluid Mechanics'] },
        { id: 'u15', name: 'Caleb H.', major: 'Mechanical Engineering', year: 4, role: 'student', bio: 'Senior in ME. Shared my ME 401 final report as an example for anyone taking the class.', courses: ['ME 401 - Thermodynamic Systems and Applications'] },
        // Psychology
        { id: 'u13', name: 'Hannah Schultz', major: 'Psychology', year: 1, role: 'student', bio: 'Freshman, curious about cognitive science.', courses: ['PSY 101 - Intro to Psychology'] },
        { id: 'u14', name: 'Omar Haddad', major: 'Psychology', year: 3, role: 'mentor', bio: 'Junior peer mentor. Research methods tutor.', courses: ['PSY 305 - Cognitive Psychology'] },
    ].map((u) => ({ ...u, email: makeEmail(u.name) }));

    const groups = [
        {
            id: 'g1',
            name: 'CS 101 Study Squad',
            course: 'CS 101 - Intro to Programming',
            major: 'Computer Science',
            description: 'Weekly problem-set sessions for Intro to Programming. Beginners welcome!',
            isPrivate: false,
            ownerId: 'u1',
            memberIds: ['u1', 'u5', 'u4'],
            invitedIds: [],
            createdAt: hoursAgo(120),
            messages: [
                { id: 'm1', userId: 'u1', text: 'Hey everyone! Library room 204 on Thursday at 6?', ts: hoursAgo(30) },
                { id: 'm2', userId: 'u5', text: 'Works for me. Can we go over loops again? Nested ones still confuse me.', ts: hoursAgo(29) },
                { id: 'm3', userId: 'u4', text: "Sure — I'll bring some practice problems. Also posted a quiz in Materials if you want to try it first.", ts: hoursAgo(28) },
            ],
        },
        {
            id: 'g2',
            name: 'Data Structures Grind',
            course: 'CS 201 - Data Structures',
            major: 'Computer Science',
            description: 'Trees, graphs, and tears. Prepping for the midterm.',
            isPrivate: true,
            ownerId: 'u2',
            memberIds: ['u2', 'u3'],
            invitedIds: ['u1'],
            createdAt: hoursAgo(80),
            messages: [
                { id: 'm4', userId: 'u2', text: 'Anyone have a good way to remember AVL rotations?', ts: hoursAgo(10) },
                { id: 'm5', userId: 'u3', text: 'Draw it out every time. Left-heavy with a left-heavy child = single right rotation. I made flashcards for this.', ts: hoursAgo(9) },
            ],
        },
        {
            id: 'g3',
            name: 'Genetics Exam Prep',
            course: 'BIO 220 - Genetics',
            major: 'Biology',
            description: 'Punnett squares, pedigrees, and more.',
            isPrivate: false,
            ownerId: 'u7',
            memberIds: ['u7', 'u6', 'u8'],
            invitedIds: [],
            createdAt: hoursAgo(200),
            messages: [
                { id: 'm6', userId: 'u7', text: 'Exam 2 covers chapters 5-8. Study session Sunday?', ts: hoursAgo(50) },
            ],
        },
        {
            id: 'g4',
            name: 'Thermo Thursdays',
            course: 'ME 320 - Thermodynamics',
            major: 'Mechanical Engineering',
            description: 'Entropy never decreases, but our grades can go up.',
            isPrivate: false,
            ownerId: 'u12',
            memberIds: ['u12', 'u11'],
            invitedIds: [],
            createdAt: hoursAgo(300),
            messages: [],
        },
    ];

    const posts = [
        {
            id: 'p1',
            authorId: 'u1',
            title: 'How do I actually get started with recursion?',
            body: "I understand the idea (function calls itself) but every time I try to write one I get infinite loops. Any tips for thinking about base cases?",
            major: 'Computer Science',
            course: 'CS 101 - Intro to Programming',
            ts: hoursAgo(26),
            replies: [
                { id: 'r1', authorId: 'u4', text: "Great question! Always write the base case FIRST, before anything else. Ask yourself: 'what is the smallest input where I already know the answer?' For factorial that's n <= 1. Then make sure every recursive call moves toward that base case.", ts: hoursAgo(24) },
                { id: 'r2', authorId: 'u5', text: 'Same boat, this helped me too. Thanks Liam!', ts: hoursAgo(20) },
            ],
        },
        {
            id: 'p2',
            authorId: 'u5',
            title: 'Is CS 201 much harder than CS 101?',
            body: 'Registering for next semester. Should I take Data Structures alongside Discrete Math or is that too much?',
            major: 'Computer Science',
            course: 'CS 201 - Data Structures',
            ts: hoursAgo(48),
            replies: [
                { id: 'r3', authorId: 'u3', text: "It's a step up, but totally doable together — they actually complement each other (proofs help with analyzing data structures). Just don't add a heavy lab course on top.", ts: hoursAgo(45) },
                { id: 'r4', authorId: 'u2', text: 'I did exactly that combo last year. It was fine as long as you start assignments early.', ts: hoursAgo(40) },
            ],
        },
        {
            id: 'p3',
            authorId: 'u2',
            title: 'Looking for internship advice (sophomore)',
            body: 'What should I be doing now to land a summer internship next year? My resume is pretty empty.',
            major: 'Computer Science',
            course: '',
            ts: hoursAgo(72),
            replies: [],
        },
        {
            id: 'p4',
            authorId: 'u6',
            title: 'Tips for memorizing the Krebs cycle?',
            body: "It's on the next exam and I keep mixing up the intermediates.",
            major: 'Biology',
            course: 'BIO 110 - General Biology',
            ts: hoursAgo(30),
            replies: [
                { id: 'r5', authorId: 'u8', text: 'Mnemonics help: "Citrate Is Krebs\' Starting Substrate For Making Oxaloacetate." Also draw the cycle from memory once a day for a week — it sticks.', ts: hoursAgo(28) },
            ],
        },
        {
            id: 'p5',
            authorId: 'u9',
            title: 'Debits vs credits — still confused',
            body: 'Why does a debit increase an asset but decrease revenue?? This feels backwards.',
            major: 'Business Administration',
            course: 'ACCT 210 - Financial Accounting',
            ts: hoursAgo(12),
            replies: [],
        },
    ];

    const materials = [
        {
            id: 'mat6',
            type: 'notes',
            title: 'ME 401 Project 2 Final Report (Example): Anaerobic Digestion and Steam Rankine Cogeneration',
            course: 'ME 401 - Thermodynamic Systems and Applications',
            major: 'Mechanical Engineering',
            authorId: 'u15',
            ts: hoursAgo(6),
            content: {
                attachment: {
                    name: 'FinalreportV2.pdf',
                    path: 'files/FinalreportV2.pdf', // lives in public/files/
                    meta: 'PDF · 16 pages',
                },
                body: `EXAMPLE FINAL REPORT: ME 401 PROJECT 2
Energy Recovery from Wastewater Sludge via Anaerobic Digestion and Steam Rankine Cogeneration
The full report is attached as a PDF below. Use it as a reference for structure and level of detail.

WHAT THE PROJECT IS
- Coupled steady-state model of an anaerobic digester (CSTR, mesophilic, 35 °C) and a steam Rankine cogeneration plant
- Biogas from the digester fires the boiler; steam extracted from the turbine heats the digester
- Written in Python with CoolProp for properties and SciPy for optimization

BASELINE CASE (3,000 m³ reactor, population 100,000)
- HRT 20 days, methane 1,200 m³/day, biogas energy 497 kW
- Digester heat demand 166 kW (about 148 kW of it is heating sludge from 15 °C to 35 °C)
- Cycle: boiler 6 MPa / 450 °C, extraction at 500 kPa, condenser at 10 kPa
- Extraction fraction y = 0.522
- Net electrical output 104 kW, process heat 166 kW
- Electrical efficiency 20.9%, CHP efficiency 54.2%
- Offsets 41.6% of the plant's 250 kW grid demand

KEY RESULTS
- Electrical self-sufficiency needs a reactor of about 7,157 m³ (roughly 2.4x baseline)
- Optimized cycle (12 MPa, 550 °C, 200 kPa extraction) gives 125.1 kW, about 20% more power
- Versus grid-only: about $91,000 per year saved, 365 tonnes of CO2 per year avoided, 2.9 year simple payback

HOW THE REPORT IS ORGANIZED
1. Introduction and objectives
2. Methodology: digester model, Rankine model (8 state points), optimization setup, grid assumptions
3. Results: baseline tables, parametric sweeps, energy balance, grid comparison, optimization, breakeven
4. Discussion: trade-offs, feasibility, economics, limitations, comparison to literature
5. Conclusion and recommendation

IF YOU ARE WRITING YOUR OWN
- A state-point table makes the cycle easy to check
- List every assumption with its number (efficiencies, costs, carbon intensity)`,
            },
        },
        {
            id: 'mat1',
            type: 'quiz',
            title: 'CS 101 Loops & Conditionals Check',
            course: 'CS 101 - Intro to Programming',
            major: 'Computer Science',
            authorId: 'u4',
            ts: hoursAgo(32),
            content: {
                questions: [
                    { q: 'How many times does this loop run?\nfor (int i = 0; i < 5; i++) { ... }', options: ['4', '5', '6', 'Infinite'], answer: 1 },
                    { q: 'Which keyword exits a loop immediately?', options: ['continue', 'return', 'break', 'exit'], answer: 2 },
                    { q: 'What does `x % 2 == 0` check?', options: ['x is positive', 'x is even', 'x is zero', 'x is odd'], answer: 1 },
                    { q: 'A while loop whose condition is never false will…', options: ['Run once', 'Never run', 'Run forever', 'Throw an error'], answer: 2 },
                ],
            },
        },
        {
            id: 'mat2',
            type: 'flashcards',
            title: 'AVL Tree Rotations',
            course: 'CS 201 - Data Structures',
            major: 'Computer Science',
            authorId: 'u3',
            ts: hoursAgo(9),
            content: {
                cards: [
                    { front: 'Left-Left imbalance', back: 'Single right rotation' },
                    { front: 'Right-Right imbalance', back: 'Single left rotation' },
                    { front: 'Left-Right imbalance', back: 'Left rotation on child, then right rotation on node' },
                    { front: 'Right-Left imbalance', back: 'Right rotation on child, then left rotation on node' },
                    { front: 'AVL balance factor', back: 'height(left) − height(right), must be in {−1, 0, 1}' },
                ],
            },
        },
        {
            id: 'mat3',
            type: 'notes',
            title: 'OS Midterm Cheat Sheet: Processes vs Threads',
            course: 'CS 340 - Operating Systems',
            major: 'Computer Science',
            authorId: 'u3',
            ts: hoursAgo(100),
            content: {
                body: `PROCESSES
- Own address space, own resources
- Heavyweight: creation/context switch is expensive
- Communicate via IPC (pipes, sockets, shared memory)

THREADS
- Share address space with other threads in the same process
- Lightweight: faster creation and switching
- Share heap/globals, have own stack + registers
- Synchronization needed (mutex, semaphore, condition variable)

CONTEXT SWITCH
1. Save state of current process/thread (registers, PC)
2. Update PCB / TCB
3. Load state of next one
4. Resume

SCHEDULING QUICK REF
- FCFS: simple, convoy effect
- SJF: optimal avg wait, needs burst prediction
- RR: fair, quantum size matters
- Priority: starvation, fix with aging`,
            },
        },
        {
            id: 'mat4',
            type: 'flashcards',
            title: 'Genetics Vocab — Exam 2',
            course: 'BIO 220 - Genetics',
            major: 'Biology',
            authorId: 'u8',
            ts: hoursAgo(52),
            content: {
                cards: [
                    { front: 'Allele', back: 'A variant form of a gene' },
                    { front: 'Heterozygous', back: 'Having two different alleles for a gene' },
                    { front: 'Codominance', back: 'Both alleles are fully expressed in the phenotype' },
                    { front: 'Epistasis', back: 'One gene masks the expression of another' },
                ],
            },
        },
        {
            id: 'mat5',
            type: 'quiz',
            title: 'PSY 101 — Research Basics',
            course: 'PSY 101 - Intro to Psychology',
            major: 'Psychology',
            authorId: 'u14',
            ts: hoursAgo(70),
            content: {
                questions: [
                    { q: 'Which method can establish causation?', options: ['Correlational study', 'Case study', 'Experiment', 'Survey'], answer: 2 },
                    { q: 'The variable the researcher manipulates is the…', options: ['Dependent variable', 'Independent variable', 'Confound', 'Control'], answer: 1 },
                ],
            },
        },
    ];

    const connections = [
        ['u1', 'u5'],
        ['u2', 'u3'],
        ['u6', 'u7'],
    ];

    return { currentUserId: null, users, groups, posts, materials, connections };
}