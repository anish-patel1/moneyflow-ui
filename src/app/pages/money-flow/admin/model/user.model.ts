import { BaseClass } from "../../common/model/base-class.model";

export interface User extends BaseClass {
    UserName: any;
    UserDisplayName: any;
    Password: any;
    UserType: any;

    // Other
    LoginStatus: any;
    IsActive: any;
    IsLocked: any;
}

export interface UserLog extends BaseClass {
    ActivityType: any
    ActivityTime: any
    Description: any
}