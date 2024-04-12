export interface FamilyMember {
        family_member_id: number,
        family_code: string,
        username: string,
        first_name: string,
        last_name: string,
        token: string,
        authdata?: string,
        family_id: number,
        color : {
                color_id : number,
                family_member_id: number,
                name: string
        }
}