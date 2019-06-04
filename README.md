# aop-decorator

### usage
```js
import AOP, { Aspect } from 'aop-decorator';

class TestAspect extends Aspect {
    Before() {
        console.log('aspect before');
    }
    After() {
        console.log('aspect after');
    }
    AfterReturning(result: any) {
        console.log('aspect AfterReturning', result);
    }
    AfterThrowing(err: Error) {
        console.log(err);
    }
    async Around({ args, proceed }: any) {
        console.log('>>around args', ...args);
        await proceed(...args);
        console.log('>>around after');
    }
}

class Test {
    @AOP(TestAspect)
    test(n: number) {
        console.log('--method test.--');
        // throw new Error('======');
        return n;
    }
}

const test = new Test();

test.test(111);

```