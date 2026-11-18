export class InteractionRegistry {
 private actions=new Map<string,()=>void>();
 register(id:string,action:()=>void){this.actions.set(id,action);}
 run(id:string){this.actions.get(id)?.();}
}
