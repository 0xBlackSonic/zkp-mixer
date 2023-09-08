pragma circom 2.0.0;

include "./montgomery.circom";

/*
    This template is a shorten adaptation of the code provided by 
    Ray Gao [Darth Cy]. 
    
    Adapted by Lucas Pigliacampi [0xBlackSonic].
*/
template BasisGenerator() {
    signal input x;
    signal input y;

    signal basis[8][51][2];

    signal output oPoints[8][50][2];

    component base[5][50];

    component adders[8][50];
    
    component e2m = Edwards2Montgomery();
    e2m.in[0] <== x;
    e2m.in[1] <== y;

    basis[0][0][0] <== e2m.out[0];
    basis[0][0][1] <== e2m.out[1];

    for(var i = 0; i < 50; i++) {
        for (var k = 0; k < 5; k++) {
            base[k][i] = MontgomeryDouble();
            base[k][i].in[0] <== k == 0 ? basis[k][i][0] : base[k - 1][i].out[0];
            base[k][i].in[1] <== k == 0 ? basis[k][i][1] : base[k - 1][i].out[1];
        }

        for (var k = 0; k < 8; k++) {
            if (k == 1 || k == 3 || k == 7) {
                basis[k][i][0] <== base[k \ 3][i].out[0];
                basis[k][i][1] <== base[k \ 3][i].out[1];
            } else if (k == 2 || k == 4 || k == 5 || k == 6) {
                adders[k][i] = MontgomeryAdd();
                adders[k][i].in1[0] <== basis[0][i][0];
                adders[k][i].in1[1] <== basis[0][i][1];
                adders[k][i].in2[0] <== basis[k - 1][i][0];
                adders[k][i].in2[1] <== basis[k - 1][i][1];

                basis[k][i][0] <== adders[k][i].out[0];
                basis[k][i][1] <== adders[k][i].out[1];
            }

            oPoints[k][i][0] <== basis[k][i][0];
            oPoints[k][i][1] <== basis[k][i][1];
        }

        basis[0][i + 1][0] <== base[4][i].out[0];
        basis[0][i + 1][1] <== base[4][i].out[1];
    }
}