import AOP, { Aspect } from '../src/index';

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
        const result = await proceed(...args);
        console.log('》》', result);
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
