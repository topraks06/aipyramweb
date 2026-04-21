/**
 * CrudOperations — Sovereign Thin Client Data Layer
 * 
 * Tüm admin bileşenleri bu sınıfı kullanır. Veriler Next.js API Route'ları
 * üzerinden çekilir (Dumb Client kuralı — doğrudan DB bağlantısı YOK).
 * 
 * Desteklenen tablolar: domain_management, ai_agents, agent_tasks, 
 * automation_rules, sectors, decision_engine, aloha_commands
 */

interface FindManyOptions {
  order?: { column: string; ascending: boolean };
  limit?: number;
}

export class CrudOperations {
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  /**
   * Fetch all records from a table, optionally filtered and ordered.
   */
  async findMany(filter?: Record<string, any>, options?: FindManyOptions): Promise<any[]> {
    try {
      const params = new URLSearchParams({ table: this.tableName });

      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          params.append(`filter_${key}`, String(value));
        });
      }

      if (options?.order) {
        params.append("orderBy", options.order.column);
        params.append("ascending", String(options.order.ascending));
      }

      if (options?.limit) {
        params.append("limit", String(options.limit));
      }

      const response = await fetch(`/api/admin/data?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        return result.data || [];
      }

      console.warn(`[CrudOperations] ${this.tableName} query returned error:`, result.error);
      return [];
    } catch (error) {
      console.error(`[CrudOperations] Failed to fetch ${this.tableName}:`, error);
      return [];
    }
  }

  /**
   * Find a single record by ID.
   */
  async findOne(id: string): Promise<any | null> {
    try {
      const response = await fetch(`/api/admin/data?table=${this.tableName}&id=${id}`);
      const result = await response.json();

      if (result.success && result.data) {
        const data = Array.isArray(result.data) ? result.data[0] : result.data;
        return data || null;
      }
      return null;
    } catch (error) {
      console.error(`[CrudOperations] Failed to find ${this.tableName}/${id}:`, error);
      return null;
    }
  }

  /**
   * Create a new record.
   */
  async create(data: Record<string, any>): Promise<any> {
    try {
      const response = await fetch(`/api/admin/data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: this.tableName, data }),
      });
      const result = await response.json();

      if (result.success) {
        return result.data;
      }
      throw new Error(result.error || "Create failed");
    } catch (error) {
      console.error(`[CrudOperations] Failed to create in ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Update a record by ID.
   */
  async update(id: string, data: Record<string, any>): Promise<any> {
    try {
      const response = await fetch(`/api/admin/data`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: this.tableName, id, data }),
      });
      const result = await response.json();

      if (result.success) {
        return result.data;
      }
      throw new Error(result.error || "Update failed");
    } catch (error) {
      console.error(`[CrudOperations] Failed to update ${this.tableName}/${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a record by ID.
   */
  async delete(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/admin/data`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: this.tableName, id }),
      });
      const result = await response.json();
      return result.success === true;
    } catch (error) {
      console.error(`[CrudOperations] Failed to delete ${this.tableName}/${id}:`, error);
      return false;
    }
  }
}
