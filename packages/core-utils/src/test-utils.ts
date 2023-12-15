/* istanbul ignore file */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
export const mock = <Fn extends (...args: any) => any>(value: Fn) =>
  (value as unknown) as jest.Mock<ReturnType<Fn>, Parameters<Fn>>

export type MockFn<Fn extends (...args: any) => any> = jest.Mock<
  ReturnType<Fn>,
  Parameters<Fn>
>

export type MockInstance<Instance> = {
  [K in keyof Instance]: Instance[K] extends (...args: any) => any
    ? MockFn<Instance[K]>
    : never
}

export type MockStaticMethod<CLASS extends { new (...args: any): any }> = {
  [K in keyof CLASS]: CLASS[K] extends (...args: any) => any
    ? MockFn<CLASS[K]>
    : never
}

export const mockClass = <CLASS extends { new (...args: any): any }>(
  value: CLASS
) => (value as unknown) as MockStaticMethod<CLASS>

export const mockInstance = <Instance>(value: Instance) =>
  (value as unknown) as MockInstance<Instance>
