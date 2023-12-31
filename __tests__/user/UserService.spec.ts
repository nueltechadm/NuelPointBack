import Mock from '../utils/Mock';
import AbstractDBContext from '../../src/data/abstract/AbstractDBContext';
import User from '../../src/core/entities/User';
import { AbstractSet } from 'myorm_core';
import { Exception } from 'web_api_base';
import Type from '../../src/utils/Type';

describe("UserService", ()=>
{
    test("AddAsync", async ()=>
    {
        let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>();
        let colletion = Mock.CreateIntanceFromAbstraction<AbstractSet<User>>();

        colletion.ChangeBehavior("AddAsync", (o : User) : Promise<User> => 
        {
          return Promise.resolve(o);   
        })

        context.ChangeBehavior("Collection",<T extends Object>(cTor : new (...args : any[]) => T) : AbstractSet<T> =>
        {
           if(cTor.name == User.name)
                return colletion as any as AbstractSet<T>;

            throw new Exception("Not mapped");                            
        });

        let t = context.Collection(User);

        expect(t).toBe(colletion);

        let user = Type.CreateInstance(User);

        let u = await t.AddAsync(user);

        expect(u).toBe(user);
    });
})