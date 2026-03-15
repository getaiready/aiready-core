'use client';

import BlogCard from '../../components/BlogCard';
import BlogHero from '../../components/BlogHero';
import Navbar from '../../components/Navbar';

interface BlogClientProps {
  apiUrl: string;
}

const BLOG_POSTS = [
  {
    slug: 'the-reflector-self-critique',
    title: 'The Reflector: Machines that Self-Critique',
    excerpt:
      'Most AI systems wait for humans to find bugs. Claw finds them itself using autonomous Gap Detection Loops.',
    date: 'Mar 28, 2026',
    readTime: '7 min read',
    hash: 'reflector',
    category: 'AGENTS',
    image:
      'https://clawmore.getaiready.dev/blog/the-reflector-self-critique.png',
  },
  {
    slug: 'surviving-void-ephemeral-persistence',
    title: 'Surviving the Void: Cross-Lifecycle Memory',
    excerpt:
      'How do you keep an AI agent from forgetting its purpose when its runtime is destroyed every 15 minutes? Exploring the S3 + DynamoDB state backbone.',
    date: 'Mar 26, 2026',
    readTime: '8 min read',
    hash: 'ephemeral',
    category: 'ARCHITECTURE',
    image:
      'https://clawmore.getaiready.dev/blog/surviving-void-ephemeral-persistence.png',
  },
  {
    slug: 'sst-ion-coder-loop',
    title: 'SST Ion & The Coder Loop',
    excerpt:
      'Closing the gap between LLM reasoning and Pulumi-based deployment. How we achieve sub-second infrastructure mutations.',
    date: 'Mar 24, 2026',
    readTime: '6 min read',
    hash: 'sstloop',
    category: 'DEVOPS',
    image: 'https://clawmore.getaiready.dev/blog/sst-ion-coder-loop.png',
  },
  {
    slug: 'cdk-monorepo-mastery',
    title: 'Infrastructure as Code: CDK Monorepo Mastery',
    excerpt:
      'Organizing a complex AI backbone into a single, deployable blueprint. How we use AWS CDK and npm workspaces to manage the serverlessclaw monorepo.',
    date: 'Mar 22, 2026',
    readTime: '7 min read',
    hash: 'cdkmono',
    category: 'INFRASTRUCTURE',
    image: 'https://clawmore.getaiready.dev/blog/cdk-monorepo-mastery.png',
  },
  {
    slug: 'omni-channel-ai-gateway',
    title: 'Omni-Channel Command: One Agent, Six Interfaces',
    excerpt:
      'Integrating Telegram, Discord, Slack, and even iMessage into a unified AI spine. How we built a multi-platform agent that never misses a pulse.',
    date: 'Mar 21, 2026',
    readTime: '8 min read',
    hash: 'omnichan',
    category: 'INTEGRATIONS',
    image: 'https://clawmore.getaiready.dev/blog/omni-channel-ai-gateway.png',
  },
  {
    slug: 'bridge-pattern-ephemeral-persistent',
    title: 'The Bridge Pattern: HTTP to WebSocket',
    excerpt:
      'Solving the "Persistent connection" problem in a serverless world. How we connect ephemeral Lambda triggers to long-running AI streams.',
    date: 'Mar 20, 2026',
    readTime: '6 min read',
    hash: 'bridge',
    category: 'PATTERNS',
    image:
      'https://clawmore.getaiready.dev/blog/bridge-pattern-ephemeral-persistent.png',
  },
  {
    slug: 'ironclad-autonomy-safety-vpc',
    title: 'Ironclad Autonomy: Safety & VPCs',
    excerpt:
      '"What if it deletes my production database?" Explaining our multi-layered approach to recursion guards and context isolation.',
    date: 'Mar 18, 2026',
    readTime: '9 min read',
    hash: 'safety',
    category: 'SECURITY',
    image:
      'https://clawmore.getaiready.dev/blog/ironclad-autonomy-safety-vpc.png',
  },
  {
    slug: 'eventbridge-the-neural-spine',
    title: 'EventBridge: The Neural Spine',
    excerpt:
      'Mapping the ClawFlow mesh. How asynchronous events allow decoupled agents to coordinate without a central controller.',
    date: 'Mar 14, 2026',
    readTime: '7 min read',
    hash: 'neuralbus',
    category: 'ARCHITECTURE',
    image:
      'https://clawmore.getaiready.dev/blog/eventbridge-the-neural-spine.png',
  },
  {
    slug: 'death-of-the-transient-agent',
    title: 'The Death of the Transient Agent',
    excerpt:
      'Why stateless chat with infrastructure is a dead end. Introducing the case for mutable logic state that persists to source control.',
    date: 'Mar 13, 2026',
    readTime: '6 min read',
    hash: 'transient',
    category: 'ARCHITECTURE',
    image:
      'https://clawmore.getaiready.dev/blog/death-of-the-transient-agent.png',
  },
  {
    slug: 'one-dollar-ai-agent',
    title: 'The $1/Month AI Agent',
    excerpt:
      'Breaking the 24/7 hosting trap. How to run a multi-channel AI backbone for the price of a single coffee.',
    date: 'Mar 12, 2026',
    readTime: '5 min read',
    hash: '1dollarai',
    category: 'INFRASTRUCTURE',
    image: 'https://clawmore.getaiready.dev/blog/one-dollar-ai-agent.png',
  },
];

export default function BlogClient({ apiUrl }: BlogClientProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar variant="post" />
      <BlogHero />

      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BLOG_POSTS.map((post) => (
            <BlogCard key={post.slug} {...post} />
          ))}
        </div>
      </section>
    </div>
  );
}
