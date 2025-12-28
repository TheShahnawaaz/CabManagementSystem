/**
 * In-memory cache for entity names to avoid repeated API calls
 * Cache key format: "entityType:entityId"
 */
class BreadcrumbCache {
  private cache: Map<string, string>;

  constructor() {
    this.cache = new Map();
  }

  /**
   * Get cached entity name
   */
  get(entityType: string, entityId: string): string | undefined {
    const key = `${entityType}:${entityId}`;
    return this.cache.get(key);
  }

  /**
   * Set cached entity name
   */
  set(entityType: string, entityId: string, name: string): void {
    const key = `${entityType}:${entityId}`;
    this.cache.set(key, name);
  }

  /**
   * Check if entity name is cached
   */
  has(entityType: string, entityId: string): boolean {
    const key = `${entityType}:${entityId}`;
    return this.cache.has(key);
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Remove specific entity from cache
   */
  remove(entityType: string, entityId: string): void {
    const key = `${entityType}:${entityId}`;
    this.cache.delete(key);
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}

// Export singleton instance
export const breadcrumbCache = new BreadcrumbCache();
