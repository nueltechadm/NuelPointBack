import Mock from '../../utils/Mock';
import AbstractDBContext from '@src/data/abstract/AbstractDBContext';
import Company from "@entities/Company";
import AbstractSet from 'myorm_core/lib/objects/abstract/AbastractSet';
import CompanyService from '@src/services/CompanyService';
import InvalidEntityException from '@src/exceptions/InvalidEntityException';
import Access from '@src/core/entities/Access';
import User from '@src/core/entities/User';
import Contact, { ContactType } from '@src/core/entities/Contact';
import Type from '@src/utils/Type';
import AcessService from '@src/services/AcessService';
import { CompanyPaginatedFilterRequest, CompanyPaginatedFilterResponse } from '@src/core/abstractions/AbstractCompanyService';

describe("CompanyService", () => {

    describe("GetAllAsync", () => {

        test("Should return a list of all fake companies", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<Company>>();
           
            context.DefineBehavior("Collection", () => collection);  
            collection.DefineBehavior("ToListAsync", () => Promise.resolve([]));  
            collection.DefineBehavior("Where", () => collection);  
          
            let service = new CompanyService(context); 
          
            let result = await service.GetAllAsync();
        
            expect.assertions(3);     
           
            expect(result instanceof Array).toBeTruthy();

            expect(collection.HasCalled("Where")).toBe(0);

            expect(collection.HasCalled("ToListAsync")).toBe(1);
           
        });
    });

    describe("AddAsync", () => {

        test("Should call validate object and NOT call AddObjectAndRelationsAsync from ORMs because the object is invalid", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<Company>>();
           
            let service = Mock.CreateInstance(CompanyService,[context]);
            let company = Type.CreateInstance(Company);
            company.Name = "";
            company.Description="";
            company.Document = "";

            context.DefineBehavior("Collection", () => collection);  
            collection.DefineBehavior("AddObjectAndRelationsAsync", (o,[...args]) => Promise.resolve(o));
            
            expect.assertions(9)

            try
            {
                await service.AddAsync(company);
            }
            catch(e)
            {
                expect(e).toBeInstanceOf(InvalidEntityException);
                expect((e as InvalidEntityException).Message).toContain("The name of Company is required"); 
                company.Name = "name";
            }

            try
            {
                await service.AddAsync(company);
            }
            catch(e)
            {
                expect(e).toBeInstanceOf(InvalidEntityException);
                expect((e as InvalidEntityException).Message).toContain(`The description of ${Company.name} is required`);
                company.Description = "description" 
            }

            try
            {
                await service.AddAsync(company);
            }
            catch(e)
            {
                expect(e).toBeInstanceOf(InvalidEntityException);
                expect((e as InvalidEntityException).Message).toContain(`The document of ${Company.name} is required`); 
            }
            
            expect(collection.HasCalled("AddObjectAndRelationsAsync")).toBe(0);
            expect(service.HasCalled('ValidateObject')).toBe(3);
            expect(service.HasCalled("IsCompatible")).toBe(3);
           
        });
       
        test("Should pass", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<Company>>();

            context.DefineBehavior("Collection", () => collection);  
            collection.DefineBehavior("AddObjectAndRelationsAsync", (o,[e]) => Promise.resolve(o));
           
            let service = new CompanyService(context);
            let access = Type.CreateInstance(Access);
            let user = Type.CreateInstance(User);
            let contacts = Type.CreateInstance(Contact);

            let company = Type.CreateInstance(Company);
            company.Accesses = [access];
            company.Active = true;
            company.Contacts = [contacts];
            company.Description = "description";
            company.Document = "document";
            company.Id = 1;
            company.Name = "name";
            company.Users = [user];

            expect.assertions(1);

            await service.AddAsync(company);
           
            expect(collection.HasCalled("AddObjectAndRelationsAsync")).toBe(1);
        
           
        });
    });

    describe("UpdateAsync", () => {

        test("Should call validate object and NOT call UpdateAsync from ORMs because the object is invalid", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<Company>>();
           
            let service = Mock.CreateInstance(CompanyService,[context]);
            let company = Type.CreateInstance(Company);
            company.Name = "";
            company.Description="";
            company.Document = "";

            context.DefineBehavior("Collection", () => collection);  
            collection.DefineBehavior("UpdateAsync", (o) => Promise.resolve(o));
            
            expect.assertions(9)

            try
            {
                await service.UpdateAsync(company);
            }
            catch(e)
            {
                expect(e).toBeInstanceOf(InvalidEntityException);
                expect((e as InvalidEntityException).Message).toContain("The name of Company is required"); 
                company.Name = "name";
            }

            try
            {
                await service.UpdateAsync(company);
            }
            catch(e)
            {
                expect(e).toBeInstanceOf(InvalidEntityException);
                expect((e as InvalidEntityException).Message).toContain(`The description of ${Company.name} is required`);
                company.Description = "description" 
            }

            try
            {
                await service.UpdateAsync(company);
            }
            catch(e)
            {
                expect(e).toBeInstanceOf(InvalidEntityException);
                expect((e as InvalidEntityException).Message).toContain(`The document of ${Company.name} is required`); 
            }
            
            expect(collection.HasCalled("UpdateAsync")).toBe(0);
            expect(service.HasCalled('ValidateObject')).toBe(3);
            expect(service.HasCalled("IsCompatible")).toBe(3);
           
        });

        test("Should pass", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<Company>>();
           
            let service = new CompanyService(context);
            let access = Type.CreateInstance(Access);
            let user = Type.CreateInstance(User);
            let contacts = Type.CreateInstance(Contact);
           
            let company = Type.CreateInstance(Company);
            company.Accesses = [access];
            company.Active = true;
            company.Contacts = [contacts];
            company.Description = "description";
            company.Document = "document";
            company.Id = 1;
            company.Name = "name";
            company.Users = [user];

            context.DefineBehavior("Collection", () => collection);  
            collection.DefineBehavior("UpdateAsync", (o) => Promise.resolve(o));
            
            expect.assertions(1);

            await service.UpdateAsync(company);

            expect(collection.HasCalled("UpdateAsync")).toBe(1);
            
           
        });
    });  

    describe("UpdateObjectAndRelationsAsync", () => {

        test("Should call validate object and NOT call UpdateObjectAndRelationsAsync from ORMs because the object is invalid", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<Company>>();
           
            let service = Mock.CreateInstance(CompanyService,[context]);
            let company = Type.CreateInstance(Company);
            company.Name = "";

            context.DefineBehavior("Collection", () => collection);  
            collection.DefineBehavior("UpdateObjectAndRelationsAsync", (o,[...args]) => Promise.resolve(Company));
            
            let contacts = Type.CreateInstance(Contact);
            contacts.Type = ContactType.EMAIL;
            contacts.Contact = "contact@teste.com"
            company.Contacts = [contacts];
            
            expect.assertions(9)

            try
            {
                await service.UpdateObjectAndRelationsAsync(company,["Contacts"]);
            }
            catch(e)
            {
                expect(e).toBeInstanceOf(InvalidEntityException);
                expect((e as InvalidEntityException).Message).toContain("The name of Company is required"); 
                company.Name = "name";
                company.Description = "";
            }

            try
            {
                await service.UpdateObjectAndRelationsAsync(company,["Contacts"]);
            }
            catch(e)
            {
                expect(e).toBeInstanceOf(InvalidEntityException);
                expect((e as InvalidEntityException).Message).toContain(`The description of ${Company.name} is required`);
                company.Description = "description" 
                company.Document = "";
            }

            try
            {
                await service.UpdateObjectAndRelationsAsync(company,["Contacts"]);
            }
            catch(e)
            {
                expect(e).toBeInstanceOf(InvalidEntityException);
                expect((e as InvalidEntityException).Message).toContain(`The document of ${Company.name} is required`); 
            }
            
            expect(collection.HasCalled("UpdateAsync")).toBe(0);
            expect(service.HasCalled('ValidateObject')).toBe(3);
            expect(service.HasCalled("IsCompatible")).toBe(3);
           
        });
       
        test("Should pass and update object and relations", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<Company>>();
           
            let service = new CompanyService(context);
            
            let company = Type.CreateInstance(Company);
            company.Accesses = [];
            company.Active = true;
            company.Contacts = [];
            company.Description = "description";
            company.Document = "document";
            company.Id = -1;
            company.Name = "name";
            company.Users = [];

            context.DefineBehavior("Collection", () => collection);  
            collection.DefineBehavior("UpdateObjectAndRelationsAsync", (o,[...args]) => Promise.resolve(Company));

            expect.assertions(2)

            let result = await service.UpdateObjectAndRelationsAsync(company,["Accesses"]);
            
            expect(result).toBe(Company);
            expect(collection.HasCalled("UpdateObjectAndRelationsAsync")).toBe(1);
            
           
        });
    });   

    describe("ExistsAsync", () => {

        test("Should call Where and CountAsync and return true if exist and false if not", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<Company>>();
           
            let service = new CompanyService(context);
            let id : number = 1 ;

            context.DefineBehavior("Collection", () => collection);  
            collection.DefineBehavior("Where", ()=> collection);
            collection.DefineBehavior("CountAsync", ()=> Promise.resolve(Number));
            
            expect.assertions(2)

            await service.ExistsAsync(id);
            
            
            expect(collection.HasCalled("Where")).toBe(1);
            expect(collection.HasCalled("CountAsync")).toBe(1);
            
           
        });

    });

    describe("DeleteAsync", () => {

        test("Should delete", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<Company>>();
           
            let service = new CompanyService(context);
            let company = Type.CreateInstance(Company);

            context.DefineBehavior("Collection", () => collection);  
            collection.DefineBehavior("DeleteAsync", (o)=> Promise.resolve(o));
            
            expect.assertions(1)

            await service.DeleteAsync(company);
               
            expect(collection.HasCalled("DeleteAsync")).toBe(1);
              
        });

    });

   /* describe("GetByNameAsync", () => {

        test("Should call ToListAsync and Where", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<Company>>();
           
            let service = new CompanyService(context);
            let company = Mock.CreateInstance(Company);

            context.DefineBehavior("Collection", () => collection);  
            collection.DefineBehavior("Where", ()=> collection);
            collection.DefineBehavior("ToListAsync", ()=> Promise.resolve([]));
            
            expect.assertions(3)

            let result  = await service.GetByNameAsync("Nome");

            expect(result).toBe(Company);   
            expect(collection.HasCalled("Where")).toBe(1);
            expect(collection.HasCalled("ToListAsync")).toBe(1);

              
        });

    });*/

    
    describe("ValidateObject", () => {

        test("Should call IsCompatible and fail because is not of Company type", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<Company>>();
           
            let service = Mock.CreateInstance(CompanyService,[context]);

            context.DefineBehavior("Collection", () => collection);  
            
            expect.assertions(3)

               try
               {
                    await service.ValidateObject({}as Company);
               } 
               catch(e)
               {
                expect(e).toBeInstanceOf(InvalidEntityException);
                expect((e as InvalidEntityException).Message).toContain("The object is not of Company type"); 
               }

               expect(service.HasCalled("IsCompatible")).toBe(1);
              
        });

        test("Should call IsCompatible and fail because The name of Company is required", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<Company>>();
           
            let service = Mock.CreateInstance(CompanyService,[context]);
            let company = Type.CreateInstance(Company);
            company.Name="";

            context.DefineBehavior("Collection", () => collection);  
            
            expect.assertions(3)

               try
               {
                    await service.ValidateObject(company);
               } 
               catch(e)
               {
                expect(e).toBeInstanceOf(InvalidEntityException);
                expect((e as InvalidEntityException).Message).toContain("The name of Company is required"); 
               }

               expect(service.HasCalled("IsCompatible")).toBe(1);
              
        });

        test("Should call IsCompatible and fail because The description of Company is required", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<Company>>();
           
            let service = Mock.CreateInstance(CompanyService,[context]);
            let company = Type.CreateInstance(Company);
            company.Name="Name";
            company.Description="";

            context.DefineBehavior("Collection", () => collection);  
            
            expect.assertions(3)

               try
               {
                    await service.ValidateObject(company);
               } 
               catch(e)
               {
                expect(e).toBeInstanceOf(InvalidEntityException);
                expect((e as InvalidEntityException).Message).toContain("The description of Company is required"); 
               }

               expect(service.HasCalled("IsCompatible")).toBe(1);
              
        });

        test("Should call IsCompatible and fail because The document of Company is required", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<Company>>();
           
            let service = Mock.CreateInstance(CompanyService,[context]);
            let company = Type.CreateInstance(Company);
            company.Name="Name";
            company.Description="Description";
            company.Document = "";

            context.DefineBehavior("Collection", () => collection);  
            
            expect.assertions(3)

               try
               {
                    await service.ValidateObject(company);
               } 
               catch(e)
               {
                expect(e).toBeInstanceOf(InvalidEntityException);
                expect((e as InvalidEntityException).Message).toContain("The document of Company is required"); 
               }

               expect(service.HasCalled("IsCompatible")).toBe(1);
              
        });

    });

    describe("CountAsync", () => {

        test("Should call count and return 0 if theres no one object and mora than zero if has", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<Company>>();
           
            let service = new CompanyService(context);

            context.DefineBehavior("Collection", () => collection);  
            collection.DefineBehavior("CountAsync", ()=> Promise.resolve(Number));
            
            expect.assertions(2)

            let result  = await service.CountAsync();

            expect(result).toBe(Number);    
            expect(collection.HasCalled("CountAsync")).toBe(1);

              
        });
    });

    describe("GetByIdAsync", () => {

        test("Should call Where,LoadRelation and FirstOrDefault of ORMs and return a company or undefined", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<Company>>();
           
            let service = new CompanyService(context);

            context.DefineBehavior("Collection", () => collection);  
            collection.DefineBehavior("Where", ()=> collection);
            collection.DefineBehavior("LoadRelationOn", ([...args])=> collection);
            collection.DefineBehavior("FirstOrDefaultAsync", ()=> Promise.resolve());  
            
            expect.assertions(4)

            let result  = await service.GetByIdAsync(1);

            if (result !== undefined)
            {
                expect(result).toBeInstanceOf(Company);
            } 
            else 
            {
                expect(result).toBeUndefined();
            }
            expect(collection.HasCalled("Where")).toBe(1);
            expect(collection.HasCalled("LoadRelationOn")).toBe(4);
            expect(collection.HasCalled("FirstOrDefaultAsync")).toBe(1);

              
        });
    });

    describe("GetByAndLoadAsync", () => {

        test("Should call Where,Load and ToListAsync of ORMs and return a list of companies", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<Company>>();
           
            let service = new CompanyService(context);

            context.DefineBehavior("Collection", () => collection);  
            collection.DefineBehavior("Where", ()=> collection);
            collection.DefineBehavior("Load", ()=> collection);
            collection.DefineBehavior("ToListAsync", ()=> Promise.resolve([])); 
            
            let key : keyof Company = 'Id';
            let value : number = 1;
            let load : (keyof Company)[] = ['Users'];

            expect.assertions(3)

            let result  = await service.GetByAndLoadAsync(key,value,load);
           
            expect(collection.HasCalled("Where")).toBe(1);
            expect(collection.HasCalled("Load")).toBe(1);
            expect(collection.HasCalled("ToListAsync")).toBe(1);

              
        });
    });

    describe("PaginatedFilterAsync", () => {

        test("Should pass and return a CompanyPaginatedFilterResponse", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<Company>>();
           
            let service = new CompanyService(context);
            let request = new CompanyPaginatedFilterRequest();
            request.Active = true;
            request.Document = "document";
            request.Name = "name";
            request.Page = 2;
            request.Quantity = 3;

            let offset : number;
            let limit : number;

            context.DefineBehavior("Collection", () => collection);  
            collection.DefineBehavior("Offset", (offset)=> collection);
            collection.DefineBehavior("Limit", (limit)=> collection);
            collection.DefineBehavior("ToListAsync", ()=> Promise.resolve([])); 
            collection.DefineBehavior("CountAsync",() => Promise.resolve(2));
            collection.DefineBehavior("Where",() => collection);

            expect.assertions(4);

            await service.PaginatedFilterAsync(request);
           
            expect(collection.HasCalled("Offset")).toBe(1);
            expect(collection.HasCalled("Limit")).toBe(1);
            expect(collection.HasCalled("ToListAsync")).toBe(1);
            expect(collection.HasCalled("CountAsync")).toBe(1);

              
        });
    }); 

});