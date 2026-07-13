# Developer-installation posts — ready to paste

These are for YOU to post (Claude can't publish to public forums under your account).
Both are updated from the old drafts: the false "advertisers love that" line is gone, and each
admits the network is small — HN and Reddit reward that and destroy anything that overpromises.

## Show HN (needs HN login — you weren't logged in on this Chrome profile)

Post at https://news.ycombinator.com/submit

**Title:** Show HN: Spincome – Earn money from terminal ads while using Claude Code
**URL:** https://spincome.io
**Text:**

> I built a terminal ad network for Claude Code. A PostToolUse hook fires after each tool call,
> fetches an ad from a real-time second-price auction, and displays it as ANSI text. You keep 50%
> of the CPM revenue.
>
> Full disclosure: the network is brand new, so earnings are currently pocket change — I'm pitching
> the first real advertisers now. The point at this stage is finding out whether the model works at all.
>
> We only collect the tool name and file extension — never your code, prompts, or file contents.
> Install: npx @brozarti/spincome. There's also a Mac menu bar widget for tracking earnings.
>
> Looking for feedback on the developer experience, and on the honest question: does a paid ad in
> your terminal feel acceptable or gross?

## r/SideProject (you ARE logged into Reddit on this Chrome profile)

Post at https://www.reddit.com/r/SideProject/submit

**Title:** I built spincome — a terminal ad network that pays you to use Claude Code
**Body:**

> Been building this for a few weeks. spincome.io puts a single text ad in your terminal after a
> Claude Code tool call. You keep 50% of the CPM revenue.
>
> Being honest about where it's at: the network is tiny right now, so earnings are pocket change
> until there are real advertisers — I'm pitching the first ones now. Install takes 30 seconds
> (npx @brozarti/spincome) and it only reads the tool name and file extension, never your code
> or prompts.
>
> Stack: Next.js, Prisma, Stripe Connect, real-time second-price auction. There's a Mac menu bar
> widget too.
>
> Mostly looking for feedback: does a paid ad in your terminal feel acceptable or gross? Both
> answers are useful.

**Pacing:** don't post both the same hour. HN first, Reddit the next day — cross-posting the same
link everywhere at once looks like a spam run and can get the domain flagged.
