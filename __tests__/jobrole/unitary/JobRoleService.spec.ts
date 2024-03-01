import Mock from '../../utils/Mock';
import AbstractDBContext from '@src/data/abstract/AbstractDBContext';
import AbstractSet from 'myorm_core/lib/objects/abstract/AbastractSet';
import JobRole from '@src/core/entities/JobRole';
import JobRoleService from '@src/services/JobRoleService';
import Type from '@utils/Type';
import Departament from '@src/core/entities/Departament';
import User from '@src/core/entities/User';
import InvalidEntityException from '@src/exceptions/InvalidEntityException';
import EntityNotFoundException from '@src/exceptions/EntityNotFoundException';
import { JobRolePaginatedFilteRequest } from '@src/core/abstractions/AbstractJobRoleService';
import { PaginatedFilterResult } from '@src/core/abstractions/AbstractService';

describe("JobRoleService", () => {

    describe("GetAllAsync", () => {

        test("Should return a list of all fakes", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<JobRole>>();
           
            context.DefineBehavior("Collection", () => collection);  
            collection.DefineBehavior("ToListAsync", () => Promise.resolve([]));  
            collection.DefineBehavior("Where", () => collection);  
          
            let service = new JobRoleService(context); 
          
            let result = await service.GetAllAsync();
        
            expect.assertions(3);     
           
            expect(result instanceof Array).toBeTruthy();

            expect(collection.HasCalled("Where")).toBe(0);

            
            expect(collection.HasCalled("ToListAsync")).toBe(1);
           
        });
    });

    describe("AddAsync", () => {

        test("Should pass and AddAsync", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<JobRole>>();
           
            context.DefineBehavior("Collection", () => collection);  
            collection.DefineBehavior("AddObjectAndRelationsAsync", (o,[e]) => Promise.resolve(o));  
          
            let service = new JobRoleService(context);
            let departament = new Departament("department");
            let user =  Type.CreateInstance(User);

            let jobrole = Type.CreateInstance(JobRole);           
            jobrole.Departament = departament;
            jobrole.Description = "description";
            jobrole.Id = 1;
            jobrole.Users = [user];

            let result = await service.AddAsync(jobrole);
        
            expect.assertions(2);     
            
            expect(result).toBeInstanceOf(jobrole);
            expect(collection.HasCalled("AddObjectAndRelationsAsync")).toBe(1);
           
        });

        test("Should fail and not call AddObjectAndRelationsAsync because of object validation", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<JobRole>>();
           
            context.DefineBehavior("Collection", () => collection);  
            collection.DefineBehavior("AddObjectAndRelationsAsync", (o,[e]) => Promise.resolve(o));  
          
            let service = Mock.CreateInstance(JobRoleService,[context]);
            let departament = Type.CreateInstance(Departament);
            let user = Type.CreateInstance(User);

            let jobrole = Type.CreateInstance(JobRole);           
            jobrole.Departament = departament;
            jobrole.Description = "";
            jobrole.Id = 1;
            jobrole.Users = [user];

            expect.assertions(4); 

            try
            {
                await service.AddAsync(jobrole);
            }
            
            catch(e)
            {
                expect(e).toBeInstanceOf(InvalidEntityException);
                expect((e as InvalidEntityException).Message).toContain("The description of JobRole is required");  
            }
        
            expect(service.HasCalled("ValidateObject")).toBe(1);
            expect(collection.HasCalled("AddObjectAndRelationsAsync")).toBe(0);
           
        });
    });

    describe("ExistsAsync", () => {

        test("Should return true if the Id exists, otherwise false", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<JobRole>>();
           
            context.DefineBehavior("Collection", () => collection);
            collection.DefineBehavior("Where", () => collection);  
            collection.DefineBehavior("CountAsync", () => { return Promise.resolve(1)});  
          
            let service = new JobRoleService(context); 
            let id: number = 1;

            await service.ExistsAsync(id);
        
            expect.assertions(2);     

            expect(collection.HasCalled("Where")).toBe(1);
            expect(collection.HasCalled("CountAsync")).toBe(1);
           
        });
    });

    describe("CountAsync", () => {

        test("Should return the number of existing jobroles", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<JobRole>>();
           
            context.DefineBehavior("Collection", () => collection);
            collection.DefineBehavior("CountAsync", () => { return Promise.resolve(1)});  
          
            let service = new JobRoleService(context); 
            let id: number = 1;

            await service.CountAsync();
        
            expect.assertions(1);     

            expect(collection.HasCalled("CountAsync")).toBe(1);
           
        });
    });

    describe("GetByIdAsync", () => {

        test("Should return the number of existing jobroles", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<JobRole>>();
           
            context.DefineBehavior("Collection", () => collection);
            collection.DefineBehavior("Where", () => collection);  
            collection.DefineBehavior("LoadRelationOn", (o) => collection); 
            collection.DefineBehavior("FirstOrDefaultAsync", () => collection);
            
          
            let service = new JobRoleService(context); 
            let id: number = 1;

            await service.GetByIdAsync(id);
        
            expect.assertions(3);     

            expect(collection.HasCalled("Where")).toBe(1);
            expect(collection.HasCalled("LoadRelationOn")).toBe(1);
            expect(collection.HasCalled("FirstOrDefaultAsync")).toBe(1);
           
        });
    });

    describe("GetByAndLoadAsync", () => {

        test("Should return true if the Id exists, otherwise false", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<JobRole>>();
           
            context.DefineBehavior("Collection", () => collection);
            collection.DefineBehavior("Where", () => collection);  
            collection.DefineBehavior("Load", (o) => collection);  
            collection.DefineBehavior("ToListAsync", () => collection);  
          
            let service = new JobRoleService(context); 
           
            let k : keyof JobRole = 'Description';
            let load: (keyof JobRole)[] = ['Description'];



            await service.GetByAndLoadAsync(k,"",load);
        
            expect.assertions(3);     

            expect(collection.HasCalled("Where")).toBe(1);
            expect(collection.HasCalled("Load")).toBe(1);
            expect(collection.HasCalled("ToListAsync")).toBe(1);
           
        });
    });

    describe("DeleteAsync", () => {

        test("Should and delete the object JobRole", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<JobRole>>();
           
            context.DefineBehavior("Collection", () => collection);
            collection.DefineBehavior("Where", () => collection);  
            collection.DefineBehavior("DeleteAsync", (o) => collection);  
            collection.DefineBehavior("FirstOrDefaultAsync", () => collection);  
          
            let users = Type.CreateInstance(User);
            let service = new JobRoleService(context); 
            let department = Type.CreateInstance(Departament);
            let jobrole = Type.CreateInstance(JobRole);
            jobrole.Id = 1 ;
            jobrole.Description = "description";
            jobrole.Departament = department;
            jobrole.Users = [users];
            
            expect.assertions(1); 

            let curr = await service.DeleteAsync(jobrole);

            expect(collection.HasCalled("DeleteAsync")).toBe(1);
           
        });


        test("Should fail because Id is required to delete a JobRole", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<JobRole>>();
           
            context.DefineBehavior("Collection", () => collection);
            collection.DefineBehavior("Where", () => collection);  
            collection.DefineBehavior("DeleteAsync", (o) => collection);  
            collection.DefineBehavior("FirstOrDefaultAsync", () => collection);  
          
            let service = new JobRoleService(context); 
            let jobrole = Type.CreateInstance(JobRole);
            
            expect.assertions(3); 

            try
            {
                let curr = await service.DeleteAsync({}as JobRole);

            }
            catch(e)
            {
                expect(e).toBeInstanceOf(InvalidEntityException);
                expect((e as InvalidEntityException).Message).toContain("Id is required to delete a JobRole");  

            }   

            expect(collection.HasCalled("DeleteAsync")).toBe(0);
           
        });

       /* test("Should fail because Id not found in database", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<JobRole>>();
           
            context.DefineBehavior("Collection", () => collection);
            collection.DefineBehavior("Where", () => collection);  
            collection.DefineBehavior("DeleteAsync", (o) => collection);  
            collection.DefineBehavior("FirstOrDefaultAsync", () => collection);  
          
            let users = Mock.CreateInstance(User);
            let service = new JobRoleService(context); 
            let department = Mock.CreateInstance(Departament);
            
            let jobrole = Mock.CreateInstance(JobRole);
            jobrole.Id = 1 ;
            jobrole.Description = "description";
            jobrole.Departament = department;
            jobrole.Users = [users];
            
            expect.assertions(3); 

            

            try
            {
                let curr = await service.DeleteAsync(jobrole);

            }
            catch(e)
            {
                expect(e).toBeInstanceOf(EntityNotFoundException);
                expect((e as EntityNotFoundException).Message).toContain(`Has no one ${JobRole.name} with Id #${jobrole.Id} in database`);  

            }    

            expect(collection.HasCalled("DeleteAsync")).toBe(1);
           
        });*/
    });

    describe("ValidateObject", () => {

        test("Should fail because object is not of jobrole type and throw a InvalidEntityException", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<JobRole>>();
           
            context.DefineBehavior("Collection", () => collection);  
          
            let service = new JobRoleService(context); 
              
            expect.assertions(2); 

            try
            {
                await service.ValidateObject({}as JobRole);
            }
            catch(e)
            {   
                expect(e).toBeInstanceOf(InvalidEntityException);
                expect((e as InvalidEntityException).Message).toContain(`The object is not of ${JobRole.name} type`);

            }
           
        });

        test("Should fail because object must have description and throw a InvalidEntityException", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<JobRole>>();
           
            context.DefineBehavior("Collection", () => collection);
          
            let users = Type.CreateInstance(User);
            let service = new JobRoleService(context); 
            let department = Type.CreateInstance(Departament);
            let jobrole = Type.CreateInstance(JobRole);
            jobrole.Id = 1 ;
            jobrole.Description = "";
            jobrole.Departament = department;
            jobrole.Users = [users];
            
            expect.assertions(2); 

            try
            {
                await service.ValidateObject(jobrole);
            }
            catch(e)
            {   
                expect(e).toBeInstanceOf(InvalidEntityException);
                expect((e as InvalidEntityException).Message).toContain(`The description of ${JobRole.name} is required`);

            }
           
        });

       /* test("Should pass and validate the object", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<JobRole>>();
           
            context.DefineBehavior("Collection", () => collection);
          
            let users = Mock.CreateInstance(User);
            let service = new JobRoleService(context); 
            let department = Mock.CreateInstance(Departament);
            let jobrole = Mock.CreateInstance(JobRole);
            jobrole.Id = 1 ;
            jobrole.Description = "description";
            jobrole.Departament = department;
            jobrole.Users = [users];
            
            expect.assertions(2); 
            
            await service.ValidateObject(jobrole);
           
           
        });*/

    });

    describe("PaginatedFilterAsync", () => {

        test("Should fail because object is not of jobrole type and throw a InvalidEntityException", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<JobRole>>();
           
            context.DefineBehavior("Collection", () => collection);  
            collection.DefineBehavior("CountAsync" , () => {return Promise.resolve(2)} );
            collection.DefineBehavior("ToListAsync", () => collection );
            collection.DefineBehavior("Limit", (limit:number) => collection );
            collection.DefineBehavior("Offset", (offset:number) => collection );

          
            let service = new JobRoleService(context); 

            let request = new JobRolePaginatedFilteRequest();
            request.Page = 5;
            request.Quantity = 4;

            expect.assertions(4);

            let response = service.PaginatedFilterAsync(request);

            expect(collection.HasCalled("CountAsync")).toBe(1);
            expect(collection.HasCalled("ToListAsync")).toBe(1);
            expect(collection.HasCalled("Limit")).toBe(1);
            expect(collection.HasCalled("Offset")).toBe(1);

           
        });

    });

});