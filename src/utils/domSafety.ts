export function installDomRemoveChildGuard() {
  if (typeof Node === "undefined") {
    return;
  }

  const nodePrototype = Node.prototype as Node & {
    removeChild: <T extends Node>(child: T) => T;
    __wetechRemoveChildGuardInstalled?: boolean;
  };

  if (nodePrototype.__wetechRemoveChildGuardInstalled) {
    return;
  }

  const nativeRemoveChild = nodePrototype.removeChild;

  nodePrototype.removeChild = function removeChildGuard<T extends Node>(
    this: Node,
    child: T
  ): T {
    if (child.parentNode !== this) {
      return child;
    }

    return nativeRemoveChild.call(this, child) as T;
  };

  nodePrototype.__wetechRemoveChildGuardInstalled = true;
}
