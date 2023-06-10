export interface HeroListResponse {
  code: number
  message: string
  data: HeroList[]
}

export interface HeroList {
  name: string
  heroid: string
  key: string
}
