import AbstractController from '../controllers/AbstractController';


export default function SetDatabaseFromToken() {
    return function (target: any, property: string, propertyDescriptor: PropertyDescriptor) {
        
        
        if (!(target instanceof AbstractController))
            return;

        let originalMethod = propertyDescriptor.value;

        try {

            if (originalMethod.constructor.name != "Function") return;

        } catch { return; }

        propertyDescriptor.value = async function (...args: any[]) {            
            await (this as AbstractController).SetClientDatabaseAsync();
            return await originalMethod.apply(this, args);
        };

    };
}
