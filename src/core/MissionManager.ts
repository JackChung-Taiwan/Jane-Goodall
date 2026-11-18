export class MissionManager<T extends string> extends Set<T> {
 complete(id:T){const changed=!this.has(id);this.add(id);return changed;}
}
