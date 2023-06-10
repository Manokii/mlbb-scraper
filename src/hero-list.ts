import { ax } from "./axios-client"
import { HeroListResponse } from "./types/hero-list"

export async function getHeroList() {
  const path = "/hero/list"
  const { data } = await ax.get<HeroListResponse>(path)
  return data.data ?? []
}
