/*
interface IAspect {
    Before?(): void;
    After?(): void;
    AfterReturning?(): void;
    AfterThrowing?(): void;
    Around?(): void;
}
[Aspect1] around advise 1
[Aspect1] before advise
test OK
[Aspect1] around advise2
[Aspect1] after advise
[Aspect1] afterReturning advise
*/

type JoinPoint = {
    args: any[],
    proceed: Function,
};

export class Aspect {
    readonly target: any;

    constructor(target: any) {
        this.target = target;
    }
}

export default function AOP(aspect: any): Function {
    if (!aspect.prototype || !(aspect.prototype instanceof Aspect)) {
        throw new Error('AOP arguments must be extends Aspect.');
    }

    return function aopDecorator(target: Function, methodName: string, desc: PropertyDescriptor) {
        if (!methodName) {
            Reflect.ownKeys(target.prototype).forEach((method: string) => {
                if (method === 'constructor') return;
                const aopMethod = aopDecorator(target, method, Reflect.getOwnPropertyDescriptor(target.prototype, method));
                Reflect.defineProperty(target.prototype, method, aopMethod);
            });

            return;
        }

        const { value: method, configurable, enumerable } = desc;
        return {
            configurable,
            enumerable,
            writable: true,
            value: async function aop(...args: any[]) {
                const aopInstance = Reflect.construct(aspect, [this]);
                const { Before, After, AfterReturning, AfterThrowing, Around } = aopInstance;
                let methodResult: any;
                let returnFlag = true;

                const proceed = async () => {
                    if (Before) {
                        const beforeResult = await Promise.resolve(Reflect.apply(Before, aopInstance, []));
                        if (beforeResult === false) return;
                    }

                    if (AfterThrowing) {
                        try {
                            methodResult = await Promise.resolve(Reflect.apply(method, this, args));
                        } catch (err) {
                            returnFlag = false;
                            await Promise.resolve(Reflect.apply(AfterThrowing, aopInstance, [err]));
                        }
                    } else {
                        methodResult = await Promise.resolve(Reflect.apply(method, this, args));
                    }

                    return methodResult;
                };

                if (Around) {
                    const point: JoinPoint = {
                        args,
                        proceed,
                    };

                    await Promise.resolve(Reflect.apply(Around, aopInstance, [point]));
                } else {
                    await proceed();
                }

                if (After) {
                    await Promise.resolve(Reflect.apply(After, aopInstance, []));
                }

                if (AfterReturning && returnFlag) {
                    await Promise.resolve(Reflect.apply(AfterReturning, aopInstance, [methodResult]));
                }
            },
        };
    };
}
