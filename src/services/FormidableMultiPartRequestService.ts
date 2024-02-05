import formidable from 'formidable';
import { Exception } from 'web_api_base';
import AbstractMultiPartRequestService, { IRequestPart, PartType } from './abstractions/AbstractMultiPartRequestService';



export default class FormidableMultiPartRequestService extends AbstractMultiPartRequestService {
    
    
    public GetPartsFromRequestAsync(request: any): Promise<IRequestPart[]> {
        let form = new formidable.IncomingForm();

        return new Promise<IRequestPart[]>((resolve, reject) => {

            form.parse(request, (err, fields, files) => {

                let result : IRequestPart[] = [];

                if (err)
                    return reject(new Exception(err));

                for(let c in fields)
                     result.Add(
                            {
                                Name : c, 
                                Type : PartType.JSON, 
                                Content: fields[c] ? fields[c].toString() : ""
                            });                     
                
                for(let c in files)
                    result.Add(
                        {
                            Name : c, 
                            Type : PartType.FILE, 
                            Content: (files[c] as any).filepath, 
                            Filename: (files[c] as any).originalFilename,
                        });    


                return resolve(result);
            });

        });
    }

}
