import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================================
  // USER & CREDITS MANAGEMENT
  // ============================================

  userCredits: defineTable({
    userId: v.string(),
    balance: v.number(),
    totalPurchased: v.number(),
    totalUsed: v.number(),
    lastUpdated: v.number(),
  }).index("userId", ["userId"]),

  creditTransactions: defineTable({
    userId: v.string(),
    type: v.union(
      v.literal("purchase"),
      v.literal("usage"),
      v.literal("refund")
    ),
    amount: v.number(),
    balance: v.number(),
    description: v.string(),
    checkoutId: v.optional(v.string()),
    createdAt: v.number(),
  }).index("userId", ["userId"]),

  // ============================================
  // ORDERS
  // ============================================

  orders: defineTable({
    userId: v.string(),
    userEmail: v.string(),
    paymentId: v.string(),
    customerId: v.string(),
    productId: v.string(),
    productName: v.string(),
    amount: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("refunded")
    ),
    creditsAmount: v.number(),
    creditsApplied: v.boolean(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    paidAt: v.optional(v.number()),
    refundedAt: v.optional(v.number()),
  })
    .index("userId", ["userId"])
    .index("userEmail", ["userEmail"])
    .index("paymentId", ["paymentId"])
    .index("status", ["status"]),

  // ============================================
  // GITHUB APP INSTALLATIONS
  // ============================================

  githubInstallations: defineTable({
    userId: v.string(),
    organizationId: v.optional(v.string()),
    installationId: v.string(),
    accountId: v.number(),
    accountLogin: v.string(),
    accountType: v.union(v.literal("User"), v.literal("Organization")),
    targetType: v.union(v.literal("User"), v.literal("Organization")),
    permissions: v.object({
      contents: v.optional(v.string()),
      pullRequests: v.optional(v.string()),
      issues: v.optional(v.string()),
    }),
    repositorySelection: v.union(v.literal("all"), v.literal("selected")),
    suspendedAt: v.optional(v.number()),
    installedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("userId", ["userId"])
    .index("installationId", ["installationId"]),

  // ============================================
  // CONNECTED REPOSITORIES
  // ============================================

  repositories: defineTable({
    installationId: v.string(),
    userId: v.string(),
    githubId: v.number(),
    nodeId: v.string(),
    name: v.string(),
    fullName: v.string(),
    owner: v.string(),
    private: v.boolean(),
    defaultBranch: v.string(),
    language: v.optional(v.string()),
    forksCount: v.number(),
    stargazersCount: v.number(),
    watchersCount: v.number(),
    openIssuesCount: v.number(),
    autoReviewEnabled: v.boolean(),
    reviewConfig: v.optional(
      v.object({
        excludeAuthors: v.array(v.string()),
        excludeBranches: v.array(v.string()),
        minFiles: v.number(),
        maxFiles: v.number(),
      })
    ),
    connectedAt: v.number(),
    lastSyncedAt: v.number(),
  })
    .index("installationId", ["installationId"])
    .index("userId", ["userId"])
    .index("githubId", ["githubId"])
    .index("installationId_and_name", ["installationId", "name"])
    .index("installationId_and_fullName", ["installationId", "fullName"]),

  // ============================================
  // AI REVIEWS
  // ============================================

  reviews: defineTable({
    userId: v.string(),
    organizationId: v.optional(v.string()),
    repositoryId: v.id("repositories"),
    installationId: v.string(),
    prNumber: v.number(),
    prTitle: v.string(),
    prAuthor: v.string(),
    prUrl: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("analyzing"),
      v.literal("reviewing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    creditsUsed: v.number(),
    filesChanged: v.number(),
    additions: v.number(),
    deletions: v.number(),
    aiProvider: v.optional(v.string()),
    aiModel: v.optional(v.string()),
    findings: v.optional(
      v.array(
        v.object({
          type: v.union(
            v.literal("bug"),
            v.literal("security"),
            v.literal("performance"),
            v.literal("style"),
            v.literal("suggestion")
          ),
          severity: v.union(
            v.literal("critical"),
            v.literal("high"),
            v.literal("medium"),
            v.literal("low")
          ),
          file: v.string(),
          line: v.optional(v.number()),
          message: v.string(),
        })
      )
    ),
    commentUrl: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("userId", ["userId"])
    .index("repositoryId", ["repositoryId"])
    .index("repositoryId_and_prNumber", ["repositoryId", "prNumber"])
    .index("status", ["status"]),

  // ============================================
  // WEBHOOK EVENTS LOG
  // ============================================

  webhookEvents: defineTable({
    source: v.union(v.literal("github"), v.literal("credits")),
    eventType: v.string(),
    deliveryId: v.string(),
    installationId: v.optional(v.string()),
    payload: v.any(),
    processed: v.boolean(),
    processedAt: v.optional(v.number()),
    error: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("source", ["source"])
    .index("processed", ["processed"])
    .index("deliveryId", ["deliveryId"]),
});
