import Mock from '../utils/Mock';
import AbstractDBContext from '@l2_src/';
import User from '../../src/core/entities/User';
import Access from '../../src/core/entities/Access';
import { AbstractSet } from 'myorm_core';
import { Exception } from 'web_api_base';

import Type from '../../src/utils/Type';

describe("UserService", ()=>
{
   let CreateContext = () => 
   {
        let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>();
        let userColletion = Mock.CreateIntanceFromAbstraction<AbstractSet<User>>();
        let accessColletion = Mock.CreateIntanceFromAbstraction<AbstractSet<Access>>();

        userColletion.ChangeBehavior("AddAsync", (o : User) : Promise<User> => 
        {
            return Promise.resolve(o);   
        })

        context.ChangeBehavior("Collection",<T extends Object>(cTor : new (...args : any[]) => T) : AbstractSet<T> =>
        {
            if(cTor.name == User.name)
                return userColletion as any as AbstractSet<T>;
            if(cTor.name == Access.name)
                return accessColletion as any as AbstractSet<T>;

            throw new Exception(`The type ${cTor.name} is not mapped a type`);                            
        });
        
        return context;
   }

    test("AddAsync", async ()=>
    {        
        let service = new UserService();
    });
})