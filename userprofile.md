## User Profile

**Primary User**: "The Social Organizer" – Winston, 25, Winston is the friend who often plans group dinners, weekend trips, and social events. They value friendship and shared experiences but are frequently the one left covering the bill and chasing down payments. They are digitally native, uses multiple apps daily, and prefers elegant solutions that save time and preserve social harmony.

**Goal**: To fairly and automatically split group expenses, ensuring everyone pays their share without performing manual calculations, sending awkward reminders, or damaging relationships over money.

**Context**:
    - When: Immediately after a group activity (right at the restaurant table, in the Uber home, at the grocery store checkout).
    - Where: Primarily on a mobile phone, in a slightly noisy or distracted social environment.
    - Device: Smartphone (95% of use cases). Sometimes later on a laptop to review history.
    - Mindset: "Let's get this settled now so we don't have to think about it later and can just enjoy the memory."

**Frustrations**:
    - The Manual Work Burden: "I have to be the accountant—doing mental math for splits, tax, and tip, then manually typing amounts and names into an app or messaging everyone individually."
    - The Memory Tax: "I'll log it later..." and then completely forgets the details, or friends genuinely forget they owe money, leading to unresolved payments and lost cash.
    - Social Awkwardness & Relationship Strain: "I feel like a nag or feel guilty asking for my money back." They hate the tension and silent resentment that builds from unclear debts.
    - Clunky, Multi-Step Apps: "The existing apps are as much work as the problem they solve." Switching between camera, calculator, and messaging apps breaks the flow.

**Technical Comfort**: Medium-High. Comfortable with modern mobile apps (Venmo, Uber, Instagram) but has zero tolerance for complexity. Expects a fast, intuitive, "it just works" experience. Will abandon an app that requires tutorials or has confusing menus.

**Time Constraints**: 2-3 minutes for a single split
    - Workflow includes:
        1. Upload receipt photo / take photo of the receipt
        2. AWS Textract processing (3 - 5 seconds)
        3. Review and edit extracted data
        4. Add participants
        5. Assign items / amounts
        6. Send notifications.