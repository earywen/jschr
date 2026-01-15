
import { getRecruitmentNeeds } from '@/lib/actions/recruitment'
import { ApplyContent } from './apply-content'

export default async function ApplyPage() {
    const needs = await getRecruitmentNeeds()

    return <ApplyContent needs={needs} />
}
