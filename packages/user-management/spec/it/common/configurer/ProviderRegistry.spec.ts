import 'jasmine';
import { SimpleProviderRegistry, Configurer, scoped, Scope, scopedDependency } from '../../../../src';
import { ReflectiveInjector } from '@zetapush/core';

abstract class A {
  abstract hello();
}
class A1 extends A {
  hello() {
    return 'hello from A1';
  }
}
class A2 extends A {
  hello() {
    return 'hello from A2';
  }
}

abstract class B {
  abstract goodbye();
}
class B1 extends B {
  goodbye() {
    return 'goodbye from B1';
  }
}
class B2 extends B {
  goodbye() {
    return 'goodbye from B2';
  }
}

abstract class C {
  abstract talk();
}
class C1 extends C {
  constructor(private a: A, private b: B) {
    super();
  }

  talk() {
    return this.a.hello() + '. ' + this.b.goodbye();
  }
}

class DecoratorForA extends A {
  constructor(private delegate: A) {
    super();
  }

  hello() {
    return this.delegate.hello() + ' and Decorator';
  }
}

class Configurer1 implements Configurer {
  async getProviders() {
    const providerRegistry = new SimpleProviderRegistry();
    providerRegistry.registerClass(A, A1);
    return providerRegistry.getProviders();
  }
}

class Configurer2 implements Configurer {
  async getProviders() {
    const providerRegistry = new SimpleProviderRegistry();
    await providerRegistry.registerConfigurer(new Configurer1());
    return providerRegistry.getProviders();
  }
}

class ScopedConfigurer1 implements Configurer {
  constructor(private scope: Scope) {}

  async getProviders() {
    const providerRegistry = new SimpleProviderRegistry();
    providerRegistry.registerClass(scoped(this.scope, A), A1);
    providerRegistry.registerClass(scoped(this.scope, B), B2);
    return providerRegistry.getProviders();
  }
}

class ConfigurerUsingScope1 implements Configurer {
  async getProviders() {
    const providerRegistry = new SimpleProviderRegistry();
    await providerRegistry.registerConfigurer(new ScopedConfigurer1(new Scope('bar')));
    providerRegistry.registerFactory(C, [scopedDependency('bar', A), scopedDependency('bar', B)], (a: A, b: B) => {
      return new C1(a, b);
    });
    return providerRegistry.getProviders();
  }
}

describe(`SimpleProviderRegistry`, () => {
  beforeEach(() => {
    this.registry = new SimpleProviderRegistry();
  });

  describe(`.registerFactory()`, () => {
    describe(`with no dependencies`, () => {
      it(`creates instance`, async () => {
        this.registry.registerFactory(A, [], () => new A2());
        const injector = ReflectiveInjector.resolveAndCreate(this.registry.getProviders());
        const a = injector.get(A);
        expect(a.hello()).toBe('hello from A2');
      });
    });
  });

  describe(`.registerDecorator()`, () => {
    describe(`with class A registered before`, () => {
      it(`decorates provider for A`, async () => {
        this.registry.registerClass(A, A1);
        this.registry.registerDecorator(A, [], (a: A) => new DecoratorForA(a));
        const injector = ReflectiveInjector.resolveAndCreate(this.registry.getProviders());
        const a = injector.get(A);
        expect(a.hello()).toBe('hello from A1 and Decorator');
      });
    });

    describe(`followed by .registerFactory()`, () => {
      it(`decorates provider for A in factory`, async () => {
        this.registry.registerClass(A, A1);
        this.registry.registerClass(B, B1);
        this.registry.registerDecorator(A, [], (a: A) => new DecoratorForA(a));
        this.registry.registerFactory(C, [A, B], (a: A, b: B) => new C1(a, b));
        const injector = ReflectiveInjector.resolveAndCreate(this.registry.getProviders());
        const c = injector.get(C);
        expect(c.talk()).toBe('hello from A1 and Decorator. goodbye from B1');
      });
    });

    describe(`with class A registered after`, () => {
      it(`decorates provider for A`, async () => {
        this.registry.registerDecorator(A, [], (a: A) => new DecoratorForA(a));
        this.registry.registerClass(A, A1);
        const injector = ReflectiveInjector.resolveAndCreate(this.registry.getProviders());
        const a = injector.get(A);
        expect(a.hello()).toBe('hello from A1 and Decorator');
      });
    });
  });

  describe(`.registerConfigurer()`, () => {
    describe(`on single level`, () => {
      it(`provides A->A1`, async () => {
        await this.registry.registerConfigurer(new Configurer1());
        const injector = ReflectiveInjector.resolveAndCreate(this.registry.getProviders());
        const a = injector.get(A);
        expect(a.hello()).toBe('hello from A1');
      });
    });

    describe(`recursive`, () => {
      it(`provides A->A1`, async () => {
        await this.registry.registerConfigurer(new Configurer2());
        const injector = ReflectiveInjector.resolveAndCreate(this.registry.getProviders());
        const a = injector.get(A);
        expect(a.hello()).toBe('hello from A1');
      });
    });
  });

  describe(`.registerConfigurer(scoped())`, () => {
    describe(`recursive`, () => {
      it(`provides A->A1, B->B2`, async () => {
        await this.registry.registerConfigurer(new ConfigurerUsingScope1());
        const injector = ReflectiveInjector.resolveAndCreate(this.registry.getProviders());
        const c = injector.get(C);
        expect(c.talk()).toBe('hello from A1. goodbye from B2');
      });
    });

    describe(`with noise dependencies`, () => {
      it(`provides A->A1, B->B2`, async () => {
        // add noise
        this.registry.registerClass(B, B1);
        await this.registry.registerConfigurer(new ConfigurerUsingScope1());
        // add noise
        this.registry.registerClass(A, A2);
        const injector = ReflectiveInjector.resolveAndCreate(this.registry.getProviders());
        const c = injector.get(C);
        expect(c.talk()).toBe('hello from A1. goodbye from B2');
      });
    });
  });
});
