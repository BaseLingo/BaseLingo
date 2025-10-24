# BaseLingo

*Learn languages and earn yield while you study. Deposit USDC, complete daily lessons, and withdraw with returns.*

## The Problem
Traditional language learning apps struggle with high user drop-off rates. Even with gamification, users often lose motivation when there's nothing tangible at stake.

## The BaseLingo Solution: Stake, Learn, Earn
BaseLingo is a decentralized language learning application that introduces real stakes to keep you motivated. By depositing crypto, you commit to your learning goals. Complete your daily lessons, and you'll earn yield on your deposit.

## How It Works
The user flow is simple and designed to keep you engaged:
1.  **Connect Your Wallet:** Get started quickly by connecting your crypto wallet.
2.  **Make a Deposit:** Stake an amount (e.g., 10 USDC) to begin your learning journey. This deposit is put into a lending protocol to generate yield.
3.  **Complete Daily Lessons:** Engage with interactive lessons. The current MVP features a German article quiz.
4.  **Post Proof to Farcaster:** After successfully completing a lesson, share your progress with a proof-of-learning statement on Farcaster.
5.  **Earn & Withdraw:** Your daily engagement unlocks your earnings. You can withdraw your initial deposit plus the yield you've earned as a reward for your consistency.

## Business Model
BaseLingo's sustainability comes from users who don't complete their tasks. Forfeited stakes are reinvested to generate yield, which allows the platform to offer premium features for free and reward the most active and dedicated learners.

## Future Potential
The BaseLingo concept is a powerful foundation that can be extended in many ways:
*   **Advanced Learning & Feedback:** Integrating LLM agents to provide personalized feedback, track progress more granularly by analyzing Farcaster posts, and create dynamic learning paths.
*   **Employer Incentive Model:** A future model where employers can stake tokens for their employees to learn a new language, creating a win-win scenario for companies and their teams.
*   **Beyond Language:** The "stake-and-learn" model can be applied to other incentive-driven tasks, such as fitness goals, coding challenges, or completing online courses.

## Getting Started (Development)
This project is a [Next.js](https://nextjs.org/) application built with TypeScript and React.

To run the frontend locally:
1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    yarn
    ```
3.  Run the development server:
    ```bash
    yarn dev
    ```
The application will be available at `http://localhost:3000`. To test the Farcaster Mini App functionality, you will need a tunneling tool like [ngrok](https://ngrok.com/).
