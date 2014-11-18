/**
 * Block Tokens
 */
var FUNCTION_BLOCK_START_TKN   = "FUNCTION_BLOCK"
var FUNCTION_BLOCK_END_TOKEN   = "END_FUNCTION_BLOCK"
var VAR_INPUT_BLOCK_START_TKN  = "VAR_INPUT"
var VAR_OUTPUT_BLOCK_START_TKN = "VAR_OUTPUT"
var VAR_BLOCK_START_TKN        = "VAR"
var VAR_BLOCK_END_TKN          = "END_VAR"
var FUZZIFY_BLOCK_START_TKN    = "FUZZIFY"
var FUZZIFY_BLOCK_END_TKN      = "END_FUZZIFY"
var DEFUZZIFY_BLOCK_START_TKN  = "DEFUZZIFY"
var DEFUZZIFY_BLOCK_END_TKN    = "END_DEFUZZIFY"
var RULEBLOCK_BLOCK_START_TKN  = "RULEBLOCK"
var RULEBLOCK_BLOCK_END_TKN    = "END_RULEBLOCK"
var OPTIONS_BLOCK_START_TKN    = "OPTIONS"
var OPTIONS_BLOCK_END_TKN      = "END_OPTIONS"

/**
 * Symbol Tokens
 */
var LEFT_PAREN_TKN             = "("
var RIGHT_PAREN_TKN            = ")"
var ASSIGN_TKN                 = ":="
var COLON_TKN                  = ":"
var COMMA_TKN                  = ","
var SEMICOLON_TKN              = ";"

/**
 * Var Tokens
 */
var REAL_VAR_TKN               = "REAL"

/**
 * Fuzzification Block Tokens
 */
var TERM_TKN                   = "TERM"

/**
 * Defuzzification Block Tokens
 */
var METHOD_TKN                 = "METHOD"
var COG_METHOD_TKN             = "COG"
var COGS_METHOD_TKN            = "COGS"
var COA_METHOD_TKN             = "COA"
var LM_METHOD_TKN              = "LM"
var RM_METHOD_TKN              = "RM"

var DEFAULT_TKN                = "DEFAULT"
var DEFAULT_NC_TKN             = "NC"

var RANGE_TKN                  = "RANGE"

/**
 * Ruleblock Tokens
 */
var ACTIVATION_METHOD_TKN      = "ACT"
var ACT_METHOD_MIN_TKN         = "MIN"
var ACT_METHOD_PROD_TKN        = "PROD"

var ACCUMULATION_METHOD_TKN    = "ACCU"
var ACCUM_METHOD_MAX_TKN       = "MAX"
var ACCUM_METHOD_BSUM_TKN      = "BSUM"
var ACCUM_METHOD_NSUM_TKN      = "NSUM"

var OPERATOR_DEF_AND_TKN       = "AND"
var AND_METHOD_BDIF_TKN        = "BDIF"
var AND_METHOD_MIN_TKN         = "MIN"
var AND_METHOD_PROF_TKN        = "PROD"

var OPERATOR_DEF_OR_TKN        = "OR"
var OR_METHOD_MAX_TKN          = "MAX"
var OR_METHOD_ASUM_TKN         = "ASUM"
var OR_METHOD_BSUM_TKN         = "BSUM"

var RULE_TKN                   = "RULE"
var IF_CONDITION_TKN           = "IF"
var THEN_CONDITION_TKN         = "THEN"
var WITH_CONDITION_TKN         = "WITH"
var AND_LOGIC_TKN              = "AND"
var OR_LOGIC_TKN               = "OR"
var IS_LOGIC_TKN               = "IS"
var NOT_LOGIC_TKN              = "NOT"