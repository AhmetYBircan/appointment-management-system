export interface Category {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  type: string;
}

export interface UpdateCategoryDto {
  name?: string;
  type?: string;
} 