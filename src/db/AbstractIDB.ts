import {openDB} from "idb";

export default function(storeName:string){
    return (async function () {
        const DB = await openDB('minilogviewer', 1, {
            upgrade(db) {
                db.createObjectStore(storeName);
            },
        });

        return {
            add: function (key: string, data: object) {
                DB.add(storeName, data, key).then(result => {
                    console.log('success!', result);
                })
                    .catch(err => {
                        console.error('error: ', err);
                    });
            },
            update: function (key: string, value: object) {
                DB.put(storeName, value, key)
            },
            delete: function (key: string) {
                DB.delete(storeName, key).then(result => {
                    console.log('success!', result);
                })
                    .catch(err => {
                        console.error('error: ', err);
                    });
            },
            all: function () {
                return DB.getAll(storeName) || []
            },
            clear: function (){
                return DB.clear(storeName) || []

            }
        }
    })()
}


