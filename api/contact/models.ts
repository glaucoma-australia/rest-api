import { IContact } from './models.d';

export const Contact = {
    identity: 'contact_tbl',
    connection: 'main_db',
    _omit: [/*'uuid'*/],
    attributes: {
        name: {
            type: 'string'
        },
        email: {
            type: 'string',
            primaryKey: true
        },
        owner: {
            type: 'string',
            required: true
        },
        toJSON: function toJSON() {
            const contact: IContact = this.toObject();
            Contact._omit.map(k => delete contact[k]);
            for (const key in contact)
                if (contact.hasOwnProperty(key) && !contact[key]) delete contact[key];
            return contact;
        }
    }
};
