/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * This class regenerates the merkle tree
 * with all the leaves
 */
import MiMC5Sponge from "./MiMC5Sponge";

export class MerkleTree {
  private nLevels: number;
  private tree: any[];
  private root: bigint;

  private levelDefaults: bigint[] = [
    10743404813422566213810265938167437702127461516201222674448064898294038940299n,
    70735641545887519915958103985255929727971262741956848692166476954535386434280n,
    31279121419317992445067586500624897568069772033690152598465994000415979732675n,
    39290719674426613021656083638863750573596787512156587996151539663895912223742n,
    60715302013634620279562078643443940965481317558744800032483111295266908252001n,
    14425213735138915338047929267951235316522897668841370511194343269989347760555n,
    72051951690337201200119845553030809436309900161084863070192560066843051838251n,
    85195535268388857280560978437974547683014948528301999669341414606440843531463n,
    64610829910958927090267841233171064846513580936036363550988647886413898466569n,
    72051951690337201200119845553030809436309900161084863070192560066843051838251n,
  ];

  constructor(leaves: bigint[], depth: number) {
    this.nLevels = depth;
    this.tree = new Array<number>();
    this.tree[0] = leaves;
    this.root = 0n;

    this.buildMerkleTree();
  }

  private buildMerkleTree() {
    let nLeaves: number = this.tree[0].length;

    let commitment: any;
    const oddCommitments: boolean = nLeaves % 2 === 1 ? true : false;
    for (let i: number = 0; i < this.nLevels; i++) {
      if (nLeaves % 2 === 1) {
        this.tree[i].push(this.levelDefaults[i]);
      }

      this.tree[i + 1] = new Array<bigint>();

      for (let j: number = 0; j <= nLeaves; j += 2) {
        if (this.tree[i][j + 1] === undefined) break;
        const left: bigint = this.tree[i][j];
        const right: bigint = this.tree[i][j + 1];

        if (j + 2 >= nLeaves && oddCommitments) {
          commitment = this.tree[0][this.tree[0].length - 2];
        } else {
          const index =
            this.tree[0].length < j + 1 + i * 2
              ? this.tree[0].length - 1
              : j + 1 + i * 2;

          commitment = this.tree[0][index];
        }

        this.tree[i + 1].push(MiMC5Sponge([left, right], commitment));
      }

      nLeaves = Math.ceil(nLeaves / 2);
    }

    this.root = this.tree[10][0];
  }

  getHashElements(
    leafIndex: number,
    lastLeaf: number
  ): {
    hashPairings: string[];
    hashDirections: number[];
    commitments: string[];
  } {
    const hashPairings: string[] = new Array<string>(10);
    const hashDirections: number[] = new Array<number>(10);
    const commitments: string[] = new Array<string>(10);
    let index: number = leafIndex;
    let commitmentIndex: number = leafIndex;

    for (let i: number = 0; i < this.nLevels; i++) {
      if (index % 2 === 0) {
        hashPairings[i] = this.tree[i][index + 1].toString();
        const tempIndex = leafIndex + (2 ** (i + 1) - 1);
        commitmentIndex = tempIndex > lastLeaf ? lastLeaf : tempIndex;
      } else {
        hashPairings[i] = this.tree[i][index - 1].toString();
      }

      commitments[i] = this.tree[0][commitmentIndex].toString();
      hashDirections[i] = index % 2;

      index >>= 1;
    }

    return { hashPairings, hashDirections, commitments };
  }

  getRoot(): string {
    return this.root.toString();
  }
}
