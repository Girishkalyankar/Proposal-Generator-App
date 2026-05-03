import { Redis } from "@upstash/redis"

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds = 60
): Promise<T> {
  const hit = await redis.get<T>(key)
  if (hit) return hit

  const data = await fn()
  await redis.set(key, JSON.stringify(data), { ex: ttlSeconds })
  return data
}
