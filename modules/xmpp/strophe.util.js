/* global __filename */
/**
 * Strophe logger implementation. Logs from level WARN and above.
 */
import { getLogger } from 'jitsi-meet-logger';
import { Strophe } from 'strophe.js';

import GlobalOnErrorHandler from '../util/GlobalOnErrorHandler';

const logger = getLogger(__filename);

/**
 * This is the last HTTP error status captured from Strophe debug logs.
 * The purpose of storing it is to distinguish between the network and
 * infrastructure reason for connection being dropped (see connectionHandler in
 * xmpp.js). The value will be cleared (-1) if the subsequent request succeeds
 * which means that the failure could be transient.
 *
 * FIXME in the latest Strophe (not released on npm) there is API to handle
 * particular HTTP errors, but there is no way to learn if the subsequent
 * request succeeded in order to tell if the error was one time incident or if
 * it was the reason for dropping the connection by Strophe (the connection is
 * dropped after 5 subsequent failures). Ideally Strophe should provide more
 * details about the reason on why the connection stopped.
 *
 * @type {number}
 */
let lastErrorStatus = -1;

/**
 * A regular expression used to catch Strophe's log message indicating that the
 * last BOSH request was successful. When there is such message seen the
 * {@link lastErrorStatus} will be set back to '-1'.
 * @type {RegExp}
 */
const resetLastErrorStatusRegExpr = /request id \d+.\d+ got 200/;

/**
 * A regular expression used to capture the current value of the BOSH request
 * error status (HTTP error code or '0' or something else).
 * @type {RegExp}
 */
const lastErrorStatusRegExpr
    = /request errored, status: (\d+), number of errors: \d+/;

/**
 *
 */
export default function() {

    Strophe.log = function(level, msg) {
    };

    /**
     * Returns error status (HTTP error code) of the last BOSH request.
     *
     * @return {number} HTTP error code, '0' for unknown or "god knows what"
     * (this is a hack).
     */
    Strophe.getLastErrorStatus = function() {
        return lastErrorStatus;
    };

    Strophe.getStatusString = function(status) {
        switch (status) {
        case Strophe.Status.ERROR:
            return 'ERROR';
        case Strophe.Status.CONNECTING:
            return 'CONNECTING';
        case Strophe.Status.CONNFAIL:
            return 'CONNFAIL';
        case Strophe.Status.AUTHENTICATING:
            return 'AUTHENTICATING';
        case Strophe.Status.AUTHFAIL:
            return 'AUTHFAIL';
        case Strophe.Status.CONNECTED:
            return 'CONNECTED';
        case Strophe.Status.DISCONNECTED:
            return 'DISCONNECTED';
        case Strophe.Status.DISCONNECTING:
            return 'DISCONNECTING';
        case Strophe.Status.ATTACHED:
            return 'ATTACHED';
        default:
            return 'unknown';
        }
    };
}
