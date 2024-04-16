export class ModuleHelper {
    constructor(roomProps) {
        this.roomClient = roomProps.roomClient;
        this.roomServer = roomProps.roomServer;
    }
    create(Classifier, value, cbAfterConstruct) {
        const obj = new Classifier({
            roomClient: this.roomClient,
            roomServer: this.roomServer,
        });
        cbAfterConstruct?.(obj);
        obj.helper = this;
        const init = () => {
            obj.initEvent({
                roomClient: this.roomClient,
                roomServer: this.roomServer,
            });
            obj.init(value);
        };
        if (obj.isClientSide()) {
            obj.awatingClientState = obj.initClient();
            obj.awatingClientState.then(init).catch(console.error);
        }
        else {
            init();
        }
        return obj;
    }
}
//# sourceMappingURL=ModuleHelper.js.map