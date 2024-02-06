import Mock, { IChangeble } from '../../utils/Mock';
import AbstractSet from 'myorm_core/lib/objects/abstract/AbastractSet';
import AccessService from '../../../src/services/AcessService'
import AcessService from '../../../src/services/AcessService';
import { Exception, Inject, UnauthorizedResult, ValidateObject } from 'web_api_base';
import Type from "@utils/Type";
import Access, { PERFILTYPE } from "@entities/Access";
import AbstractDBContext from "@data-contracts/AbstractDBContext";
import InvalidEntityException from '@src/exceptions/InvalidEntityException';
import { PaginatedFilterRequest, PaginatedFilterResult } from '@src/core/abstractions/AbstractService';

describe("AccessService", () => {
  
    describe("CountAsync",() => {

        test("Should call CountAsync of ORMs collection and return 0 if NOT exists and >0 if found ", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<Access>>();              
           
            let service = Mock.CreateInstance(AccessService, [context]); 

            
            context.DefineBehavior("Collection", () => collection); 
            collection.DefineBehavior("CountAsync", () => {Promise.resolve(1)});   
            

            await service.CountAsync();

            expect.assertions(1);
            expect(collection.HasCalled("CountAsync")).toBe(1);
                
        });
    });

    describe("AddAsync", () => {

        test("Should pass the validation and call AddAsync", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<Access>>();
 
            context.DefineBehavior("Collection", () => collection);  
            collection.DefineBehavior("AddAsync",(o)=> Promise.resolve(o));
                   
            let service = Mock.CreateInstance(AccessService, [context]); 

            let access = Type.CreateInstance(Access);            

            expect.assertions(2);

            await service.AddAsync(access);            
            
            expect(service.HasCalled("ValidateObject")).toBe(1);
            expect(collection.HasCalled("AddAsync")).toBe(1);
           
        });

        test("Should NOT pass the validation and NOT call AddAsync", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<Access>>();
 
            context.DefineBehavior("Collection", () => collection);  
            collection.DefineBehavior("AddAsync", (o)=> Promise.resolve(o));
                   
            let service = Mock.CreateInstance(AccessService, [context]); 

            let access = Type.CreateInstance(Access);            
            access.Username = "";            

            expect.assertions(6);

            try
            {
                await service.AddAsync(access); 
            }
            catch(e)
            {
                expect(e).toBeInstanceOf(InvalidEntityException);
                expect((e as InvalidEntityException).Message).toContain(Access.name);
                access.Username = "username";
                access.Password = "";
            }    
            
            try
            {
                await service.AddAsync(access); 
            }
            catch(e)
            {
                expect(e).toBeInstanceOf(InvalidEntityException);
                expect((e as InvalidEntityException).Message).toContain(Access.name);
            } 
            
            expect(service.HasCalled("ValidateObject")).toBe(2);
            expect(collection.HasCalled("AddAsync")).toBe(0);
           
        });
    }); 
      
    describe("DeleteAsync", () => {

        test("Should pass and call DeleteAsync of ORMs ", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<Access>>();
             
            let access = Type.CreateInstance(Access);
            let service = new AccessService(context);

            context.DefineBehavior("Collection", () => collection);  
            collection.DefineBehavior("DeleteAsync",(o)=> Promise.resolve(o));
 
            await service.DeleteAsync(access);
 
            expect(context.HasCalled("Collection")).toBe(1);
            expect(collection.HasCalled("DeleteAsync")).toBe(1);       
        
        });
    });
      
    describe("UpdateObjectAndRelationsAsync", () => {

        test("Should pass the validation and call UpdateObjectAndRelationsAsync ", async () => {           
                            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<Access>>();
 
            context.DefineBehavior("Collection", () => collection);  
            collection.DefineBehavior("UpdateObjectAndRelationsAsync",(o, u)=> Promise.resolve(o));
                   
            let service = Mock.CreateInstance(AccessService, [context]); 

            let access = Type.CreateInstance(Access);            

            expect.assertions(2);

            await service.UpdateObjectAndRelationsAsync(access,["Username"]);            
            
            expect(service.HasCalled("ValidateObject")).toBe(1);
            expect(collection.HasCalled("UpdateObjectAndRelationsAsync")).toBe(1);
        
        });
        
        test("Should NOT pass the validation and NOT call UpdateObjectAndRelationsAsync", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<Access>>();
 
            context.DefineBehavior("Collection", () => collection);  
            collection.DefineBehavior("UpdateObjectAndRelationsAsync",(o, relations:(keyof Access))=> Promise.resolve(o));
                   
            let service = Mock.CreateInstance(AccessService, [context]); 

            let access = Type.CreateInstance(Access);      
            access.Username= "";      

            expect.assertions(2);

            try
            {
            await service.UpdateObjectAndRelationsAsync(access,["Username"]);            
            }
            catch(e)
            {

            }

            expect(service.HasCalled("ValidateObject")).toBe(1);
            expect(collection.HasCalled("UpdateObjectAndRelationsAsync")).toBe(0);
           
        });
    });
       
    describe("UpdateAsync",() => {

        test("Should pass the validation and call UpdateAsync ", async () => {           
                
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<Access>>();
 
            context.DefineBehavior("Collection", () => collection);  
            collection.DefineBehavior("UpdateAsync",(o)=> Promise.resolve(o));
                   
            let service = Mock.CreateInstance(AccessService, [context]); 

            let access = Type.CreateInstance(Access);            

            expect.assertions(2);

            await service.UpdateAsync(access);            
            
            expect(service.HasCalled("ValidateObject")).toBe(1);
            expect(collection.HasCalled("UpdateAsync")).toBe(1);
        });

        test("Should NOT pass the validation and NOT call UpdateAsync", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<Access>>();
 
            context.DefineBehavior("Collection", () => collection);  
            collection.DefineBehavior("UpdateAsync", (o)=> Promise.resolve(o));
                   
            let service = Mock.CreateInstance(AccessService, [context]); 

            let access = Type.CreateInstance(Access);            
            access.Username = "";            

            expect.assertions(6);

            try
            {
                await service.UpdateAsync(access); 
            }
            catch(e)
            {
                expect(e).toBeInstanceOf(InvalidEntityException);
                expect((e as InvalidEntityException).Message).toContain(Access.name);
                access.Username = "username";
                access.Password = "";
            }    
            
            try
            {
                await service.UpdateAsync(access); 
            }
            catch(e)
            {
                expect(e).toBeInstanceOf(InvalidEntityException);
                expect((e as InvalidEntityException).Message).toContain(Access.name);
            }                     
            
            expect(service.HasCalled("ValidateObject")).toBe(2);
            expect(collection.HasCalled("UpdateAsync")).toBe(0);
           
        });
     
        
    });

    describe("ValidateObject", () => {

        test("Should fail because object ins't equal a Access", async () => {           
                
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
           
            let service = Mock.CreateInstance(AccessService, [context]);   

            try
            {
                service.ValidateObject({}as Access);
            }
            catch(e)
            {
                expect(e).toBeInstanceOf(InvalidEntityException);
                expect((e as InvalidEntityException).Message).toContain('Access');
            }
            
            expect(service.HasCalled("IsCompatible")).toBe(1);
            
        });

        test("Should pass and validate the object Acess", async () => {           
                
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
   
            let service = Mock.CreateInstance(AccessService, [context]);   

            let access = Type.CreateInstance(Access);
            
            expect.assertions(1);

            service.ValidateObject(access);  

            expect(service.HasCalled("IsCompatible")).toBe(1)
    
        });
        
        test("Should fail because object password's empty", async () => {           
                
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
       
            let service = Mock.CreateInstance(AccessService, [context]);   

            let access = Type.CreateInstance(Access);
            access.Username ='username';
            access.Password="";
            expect.assertions(3);

            try
            {
                service.ValidateObject(access);  
        
            }
            catch(e)
            { 
                expect(e).toBeInstanceOf(InvalidEntityException);
                expect((e as InvalidEntityException).Message).toContain('The password of Access is required');
            }
        
            expect(service.HasCalled("IsCompatible")).toBe(1);
            
        
        });
    
        test("Should fail because object name's empty", async () => {           
                
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
           
            let service = Mock.CreateInstance(AccessService, [context]);   

            let access = Type.CreateInstance(Access);
            access.Username ='';
            expect.assertions(3);

            try
            {
                service.ValidateObject(access);  
            
            }
            catch(e)
            { 
                expect(e).toBeInstanceOf(InvalidEntityException);
                expect((e as InvalidEntityException).Message).toContain("The username of Access is required");
            }
            
            expect(service.HasCalled("IsCompatible")).toBe(1);
    
            
        });

    });

    describe("ExistsAsync",() => {

        test("Should return false if NOT exist and true if found ", async () => {           
                
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<Access>>();
 
            let id:number = 1;  

            let service = new AccessService(context);
            context.DefineBehavior("Collection", () => collection);  
            collection.DefineBehavior("Where", () => collection);
            collection.DefineBehavior("CountAsync", () => Promise.resolve(1));

            await service.ExistsAsync(id);
            
            expect.assertions(2);

            expect(collection.HasCalled("Where")).toBe(1);
            expect(collection.HasCalled("CountAsync")).toBe(1);
            
        });

    });

    describe("GetByIdAsync",() => {

        test("Should search for the given id and return a object Access ", async () => {           
                
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<Access>>();
 
            context.DefineBehavior("Collection", () => collection);  
            collection.DefineBehavior("Where", () => collection);
            collection.DefineBehavior("LoadRelationOn",(e) => collection);
            collection.DefineBehavior("FirstOrDefaultAsync",(o)=> Promise.resolve(o));

            let service = new AcessService(context);

            await service.GetByIdAsync(1);

            expect.assertions(4);
            expect(context.HasCalled("Collection")).toBe(1);
            expect(collection.HasCalled("Where")).toBe(1);
            expect(collection.HasCalled("LoadRelationOn")).toBe(1);
            expect(collection.HasCalled("FirstOrDefaultAsync")).toBe(1);  
            
        });

    });

    describe("GetByAndLoadAsync", () => {

        test("Should call Where,Load and ToListAsync of ORMs  ", async () => {           
                
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<Access>>();
   
            context.DefineBehavior("Collection", () => collection); 
            collection.DefineBehavior("Where", () => collection );
            collection.DefineBehavior("Load", (l) => collection );
            collection.DefineBehavior("ToListAsync",()=> collection);
            let service = new AcessService(context);

            let k : (keyof Access) = 'Username'
            let l :keyof Access;
            await service.GetByAndLoadAsync<"Username">('Username',k,[k]);

            expect.assertions(3);
            expect(collection.HasCalled("Where")).toBe(1);
            expect(collection.HasCalled("Load")).toBe(1);
            expect(collection.HasCalled("ToListAsync")).toBe(1); 
        });

    });

    describe("PaginatedFilterAsync", () => {

        test("Should call CountAsync,ToListAsync,Limit,Offset and orderBy of ORMs ", async () => {           
                
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<Access>>();

            context.DefineBehavior("Collection", () => collection); 
            collection.DefineBehavior("CountAsync", () => Promise.resolve(1));
            collection.DefineBehavior("ToListAsync", () => Promise.resolve([]));
            collection.DefineBehavior("Limit", (o) => collection);
            collection.DefineBehavior("Offset", (o) => collection);
            collection.DefineBehavior("OrderBy", (o) => collection);
        
            let service = new AccessService(context);


            let request = new PaginatedFilterRequest();
            request.Page = 2;
            request.Quantity = 2;

            await service.PaginatedFilterAsync(request);

            expect.assertions(5);
            expect(collection.HasCalled("CountAsync")).toBe(1);
            expect(collection.HasCalled("ToListAsync")).toBe(1);
            expect(collection.HasCalled("Limit")).toBe(1);
            expect(collection.HasCalled("Offset")).toBe(1);
            expect(collection.HasCalled("OrderBy")).toBe(1);

        });

    });


});