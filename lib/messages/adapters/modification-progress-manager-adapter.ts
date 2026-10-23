import type { IModificationProgressManager } from "../types.ts";

/**
 * Adapter to provide modification progress tracking functionality
 */
export class ModificationProgressManagerAdapter
  implements IModificationProgressManager
{
  private setIsModifyingFn: (isModifying: boolean) => void;
  private setModifyEntityFn: (entity: unknown) => void;

  constructor(
    setIsModifyingFn: (isModifying: boolean) => void,
    setModifyEntityFn: (entity: unknown) => void,
  ) {
    this.setIsModifyingFn = setIsModifyingFn;
    this.setModifyEntityFn = setModifyEntityFn;
  }

  setIsModifying(isModifying: boolean): void {
    this.setIsModifyingFn(isModifying);
  }

  setModifyEntity(entity: unknown): void {
    this.setModifyEntityFn(entity);
  }

  /**
   * Create adapter from Redux dispatch functions
   */
  static fromReduxDispatch(
    setIsModifyingDispatch: (isModifying: boolean) => void,
    setModifyEntityDispatch: (entity: unknown) => void,
  ): ModificationProgressManagerAdapter {
    return new ModificationProgressManagerAdapter(
      setIsModifyingDispatch,
      setModifyEntityDispatch,
    );
  }
}
