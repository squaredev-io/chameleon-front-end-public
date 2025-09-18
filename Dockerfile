# STAGE 1: A container with pnpm is required
FROM node:21 AS base

#ENV PNPM_HOME="/pnpm"
#ENV PATH="$PNPM_HOME:$PATH"
#RUN corepack enable
#COPY . /app
WORKDIR /app

# install pnpm
RUN npm i --global --no-update-notifier --no-fund pnpm@9

# Install extra dependencies only when needed
#FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
#RUN apk add --no-cache libc6-compat
#WORKDIR /app

# STAGE 2: fetch deps into the pnpm store
# We run pnpm fetch in a separate step to avoid re-fetching deps on every code change
# fetch is a pnpm command that downloads all dependencies to the local store
# You could remove or skip this step if using npm or yarn (but make sure to copy your lock file)
FROM base as deps
WORKDIR /app

# setting production env usually speeds up install for your package manager
ENV NODE_ENV production

# copy the lock file that you use
COPY package.json pnpm-lock.yaml ./

# set the store dir to a folder that is not in the project
RUN pnpm config set store-dir /workdir/.pnpm-store
RUN pnpm fetch

# STAGE 3: Copy the application code and install all deps from cache into the application
# Rebuild the source code only when needed
FROM deps AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm install --prefer-offline

# STAGE 4: Build the NextJS app
RUN pnpm build

# STAGE 5: Create a clean production image - only take pruned assets
# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# We set the NODE_ENV to production to make sure that the NextJS app runs in production mode
ENV NODE_ENV=production

# We add a non-root user to run the app for security reasons
#RUN addgroup --system --gid 1001 app
#RUN adduser --system --uid 1001 app
RUN addgroup --system --gid 1001 nodejs \
&& adduser --system --uid 1001 nextjs
#USER app

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
#RUN mkdir -p .next
#RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/.env.production ./
COPY entrypoint.sh ./

RUN chmod +x ./entrypoint.sh

USER nextjs

# Set the port that the NextJS app will run on
# You should choose a port that is supported by your cloud provider
ENV PORT 3000
# Expose the port to the outside world
EXPOSE 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "server.js"]
