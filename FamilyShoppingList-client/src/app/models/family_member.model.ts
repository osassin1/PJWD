export interface FamilyMember {
        family_member_id: number,
        username: string,
        first_name: string,
        last_name: string,
        color : {
                color_id : number,
                family_member_id: number,
                name: string
        }
}