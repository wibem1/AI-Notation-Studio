import QtQuick 2.2
QtObject {
    id: stub
    signal finished(int exitCode, int exitStatus)
    signal errorOccurred(int error)
    property string program: ""
    property var arguments: []
    function startWithArgs(p, a) { program = p; stub.arguments = a }
}
