import Mock from '../../utils/Mock';
import AbstractDBContext from '@src/data/abstract/AbstractDBContext';
import User from '@entities/User';
import Access, { PERFILTYPE } from '@entities/Access';
import { AbstractSet } from 'myorm_core';
import Type from '@utils/Type';
import UserService from '@src/services/UserService';
import InvalidEntityException from '@src/exceptions/InvalidEntityException';
import Company from '@src/core/entities/Company';
import JobRole from '@src/core/entities/JobRole';
import { MD5 } from '@src/utils/Cryptography';

describe("UserService", ()=>
{
    describe("AddAsync",()=>{


        test("Should fail because some relations are requireds and NOT call AddAsync of ORMs collection", async ()=>
        {        
            //vai clonar um context 
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
    
            //vai clonar uma colletion do ORM
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<User>>();   
            
            //simula comportamentos dos clones
            context.DefineBehavior("Collection", ()=> collection);
            collection.DefineBehavior("AddAsync", (o)=> Promise.resolve(o));
            
            let service = new UserService(context);
    
            //cria um user fake
            let user = Type.CreateInstance(User);
    
            let result : User;
    
            //deve ter 7 expects
            expect.assertions(7);
    
            try
            {
               result = await service.AddAsync(user);
            }
            catch(e)
            {
                //deve falhar e dar a mensagem avisando sobre a falta do acesso
                expect(e).toBeInstanceOf(InvalidEntityException);
                expect((e as InvalidEntityException).Message).toContain(Access.name);
    
                //adiciona o acesso e tenta incluir denovo
                user.Access = Type.CreateInstance(Access);
            }   
            
            try
            {
               result = await service.AddAsync(user);
            }
            catch(e)
            {
                //deve falhar e dar a mensagem avisando sobre a falta da empresa
                expect(e).toBeInstanceOf(InvalidEntityException);
                expect((e as InvalidEntityException).Message).toContain(Company.name);
    
                //adiciona a empresa e tenta incluir denovo
                user.Company = Type.CreateInstance(Company);
            }     
            
            try
            {
               result = await service.AddAsync(user);
            }
            catch(e)
            {
                 //deve falhar e dar a mensagem avisando sobre a falta do cargo
                expect(e).toBeInstanceOf(InvalidEntityException);
                expect((e as InvalidEntityException).Message).toContain(JobRole.name);            
            }    
    
            
            //no final, não deve ter chamado o metodo para adicionar do ORM nenhuma vez
            expect(collection.HasCalled("AddAsync")).toBe(0);
            
        });
    
        test("Should pass and check the password", async ()=>
        {        
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>();
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<User>>();   
            
            context.DefineBehavior("Collection", ()=> collection);
            collection.DefineBehavior("AddAsync", (o)=> Promise.resolve(o));
            
            let service = new UserService(context);
    
            let user =Type.CreateInstance(User);     
            user.Access = Type.CreateInstance(Access); 
            user.Access.Perfil = PERFILTYPE.SUPER;
            user.Access.Id = 10;
            user.Access.Password = "adriano";      
    
            expect.assertions(4);
    
            let result = await service.AddAsync(user);
    
            expect(user.Access.Id).toBe(-1); 
            expect(user.Access.Password).toBe(MD5("adriano"));
            expect(collection.HasCalled("AddAsync")).toBe(1);
            expect(result).toBe(user);
            
        });
    
    
        test("Should pass because user is superuser", async ()=>
        {        
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>();
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<User>>();   
            
            context.DefineBehavior("Collection", ()=> collection);
            collection.DefineBehavior("AddAsync", (o)=> Promise.resolve(o));
            
            let service = new UserService(context);
    
            let user = Mock.CreateInstance(User, []);   
            user.Access = Type.CreateInstance(Access); 
            user.Access.Perfil = PERFILTYPE.SUPER;
    
            expect.assertions(3);
    
            let result = await service.AddAsync(user);
            
            expect(user.HasCalled("IsSuperUser")).toBe(2);
            expect(collection.HasCalled("AddAsync")).toBe(1);
            expect(result).toBe(user);
            
        });
    
    
        test("Should pass", async ()=>
        {        
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>();
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<User>>();   
            
            context.DefineBehavior("Collection", ()=> collection);
            collection.DefineBehavior("AddAsync", (o)=> Promise.resolve(o));
            
            let service = new UserService(context);
    
            let user = Mock.CreateInstance(User, []);     
            user.Access = Type.CreateInstance(Access); 
            user.Access.Perfil = PERFILTYPE.ADM;
            user.Company = Type.CreateInstance(Company);
            user.JobRole = Type.CreateInstance(JobRole);      
    
            expect.assertions(3);
    
            let result = await service.AddAsync(user);
            
            expect(user.HasCalled("IsSuperUser")).toBe(0);
            expect(collection.HasCalled("AddAsync")).toBe(1);
            expect(result).toBe(user);
            
        });   
    });


    describe("UpdateAsync", ()=>
    {
        test("Should fail because Access and NOT call UpdateAsync of ORMs colletion", async ()=>
        {        
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>();
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<User>>(); 

            let current = Type.CreateInstance(User); 
            current.Access = Type.CreateInstance(Access);

            context.DefineBehavior("Collection", ()=> collection);
            collection.DefineBehavior("Where", ()=> collection);
            collection.DefineBehavior("Load", ()=> collection);
            collection.DefineBehavior("ToListAsync", ()=> Promise.resolve([current]));
            collection.DefineBehavior("UpdateObjectAndRelationsAsync", (o)=> Promise.resolve(o));
            
            let service = new UserService(context);
    
            let user = Type.CreateInstance(User); 
            let result : User;

            expect.assertions(3);
    
            try
            {
                result = await service.UpdateObjectAndRelationsAsync(user, ["Access"]); 
            }    
            catch(e)
            {                 
                expect(e).toBeInstanceOf(InvalidEntityException);
                expect((e as InvalidEntityException).Message).toContain(Access.name);     
            }        
           
            expect(collection.HasCalled("UpdateObjectAndRelationsAsync")).toBe(0);            
            
        });  

        test("Should change the user password ", async ()=>
        {        
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>();
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<User>>();   
            
            let current = Type.CreateInstance(User); 
            current.Access = Type.CreateInstance(Access);
            current.Access.Password = MD5("adriano");

            context.DefineBehavior("Collection", ()=> collection);
            collection.DefineBehavior("Where", ()=> collection);
            collection.DefineBehavior("Load", ()=> collection);
            collection.DefineBehavior("ToListAsync", ()=> Promise.resolve([current]));
            collection.DefineBehavior("UpdateObjectAndRelationsAsync", (o)=> Promise.resolve(o));
            
            let service = new UserService(context);
    
            let user = Type.CreateInstance(User); 
            user.Access = Type.CreateInstance(Access);
            user.Access.Password = "senha";

            expect.assertions(3);
    
            let result = await service.UpdateObjectAndRelationsAsync(user, ["Access"]);            
           
            expect(user.Access.Password).toBe(MD5("senha"));
            expect(collection.HasCalled("UpdateObjectAndRelationsAsync")).toBe(1);
            expect(result).toBe(user);
            
        });  
    });

   
})